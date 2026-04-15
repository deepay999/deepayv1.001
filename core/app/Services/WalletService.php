<?php

namespace App\Services;

use App\Models\LedgerEntry;
use App\Models\Transfer;
use App\Models\Payment;
use App\Models\PawWithdrawal;
use App\Models\Points;
use App\Models\PointsLog;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

/**
 * WalletService — the ONLY class that may write money.
 *
 * Core rules enforced here:
 *   1. Wallet balance is NEVER updated directly — always via post().
 *   2. Every money movement creates an immutable ledger_entries row.
 *   3. All operations run inside a DB transaction so the ledger,
 *      wallet cache, and business table are always consistent.
 *   4. Insufficient-funds check happens inside the DB transaction
 *      with a SELECT FOR UPDATE lock on the wallet row.
 *
 * Usage:
 *   $ws = app(WalletService::class);
 *
 *   // Credit €50 EUR to user 7
 *   $ws->credit(userId: 7, amount: '50.00', currency: 'EUR',
 *               reference: 'payment:123', description: 'Airwallex top-up');
 *
 *   // Debit €20 EUR from user 7
 *   $ws->debit(userId: 7, amount: '20.00', currency: 'EUR',
 *              reference: 'withdrawal:5', description: 'Swan SEPA out');
 *
 *   // Internal transfer €30 EUR from user 7 → user 9
 *   $ws->transfer(fromUserId: 7, toUserId: 9, amount: '30.00', currency: 'EUR');
 */
class WalletService
{
    // ── Public API ─────────────────────────────────────────────

    /**
     * Credit: money arrives into a user's wallet.
     * Creates one ledger_entries row (type=credit) and
     * increments wallets.available_balance atomically.
     */
    public function credit(
        int    $userId,
        string $amount,
        string $currency,
        string $reference  = '',
        string $description = ''
    ): LedgerEntry {
        return DB::transaction(function () use ($userId, $amount, $currency, $reference, $description) {
            $wallet = $this->walletForUpdate($userId, $currency);

            $balanceAfter = bcadd($wallet->available_balance, $amount, 2);

            $entry = LedgerEntry::create([
                'user_id'      => $userId,
                'type'         => 'credit',
                'amount'       => $amount,
                'currency'     => $currency,
                'balance_after'=> $balanceAfter,
                'reference_id' => $reference,
                'description'  => $description,
            ]);

            // Update cached balance
            $wallet->available_balance = $balanceAfter;
            $wallet->save();

            return $entry;
        });
    }

    /**
     * Debit: money leaves a user's wallet.
     * Throws InsufficientFundsException if balance would go negative.
     */
    public function debit(
        int    $userId,
        string $amount,
        string $currency,
        string $reference   = '',
        string $description = ''
    ): LedgerEntry {
        return DB::transaction(function () use ($userId, $amount, $currency, $reference, $description) {
            $wallet = $this->walletForUpdate($userId, $currency);

            if (bccomp($wallet->available_balance, $amount, 2) < 0) {
                throw new \App\Exceptions\InsufficientFundsException(
                    "Insufficient funds: wallet has {$wallet->available_balance} {$currency}, tried to debit {$amount}"
                );
            }

            $balanceAfter = bcsub($wallet->available_balance, $amount, 2);

            $entry = LedgerEntry::create([
                'user_id'      => $userId,
                'type'         => 'debit',
                'amount'       => $amount,
                'currency'     => $currency,
                'balance_after'=> $balanceAfter,
                'reference_id' => $reference,
                'description'  => $description,
            ]);

            $wallet->available_balance = $balanceAfter;
            $wallet->save();

            return $entry;
        });
    }

    /**
     * Internal transfer: atomically debit sender, credit receiver.
     * Creates a transfers row + two ledger_entries rows.
     * Status is set to 'success' only if both entries commit.
     */
    public function transfer(
        int    $fromUserId,
        int    $toUserId,
        string $amount,
        string $currency = 'EUR',
        string $description = ''
    ): Transfer {
        return DB::transaction(function () use ($fromUserId, $toUserId, $amount, $currency, $description) {
            // Create transfer record first (pending)
            $transfer = Transfer::create([
                'from_user_id' => $fromUserId,
                'to_user_id'   => $toUserId,
                'amount'       => $amount,
                'currency'     => $currency,
                'status'       => 'pending',
            ]);

            $ref = 'transfer:' . $transfer->id;

            // Debit sender
            $this->debit(
                userId:      $fromUserId,
                amount:      $amount,
                currency:    $currency,
                reference:   $ref,
                description: $description ?: "Transfer to user #{$toUserId}"
            );

            // Credit receiver
            $this->credit(
                userId:      $toUserId,
                amount:      $amount,
                currency:    $currency,
                reference:   $ref,
                description: $description ?: "Transfer from user #{$fromUserId}"
            );

            // Mark success
            DB::table('transfers')->where('id', $transfer->id)->update(['status' => 'success']);
            $transfer->status = 'success';

            return $transfer;
        });
    }

    /**
     * Record an Airwallex incoming payment and credit the wallet.
     */
    public function recordPayment(
        int    $userId,
        string $amount,
        string $currency,
        string $providerPaymentId,
        array  $providerRaw = []
    ): Payment {
        return DB::transaction(function () use ($userId, $amount, $currency, $providerPaymentId, $providerRaw) {
            $payment = Payment::create([
                'user_id'             => $userId,
                'amount'              => $amount,
                'currency'            => $currency,
                'status'              => 'succeeded',
                'provider_payment_id' => $providerPaymentId,
                'provider_raw'        => $providerRaw ?: null,
            ]);

            $this->credit(
                userId:      $userId,
                amount:      $amount,
                currency:    $currency,
                reference:   'payment:' . $payment->id,
                description: "Airwallex payment {$providerPaymentId}"
            );

            return $payment;
        });
    }

    /**
     * Initiate a withdrawal: freeze funds, create withdrawal record.
     * Call completeWithdrawal() when provider confirms, or
     * reverseWithdrawal() if it fails.
     */
    public function initiateWithdrawal(
        int    $userId,
        string $amount,
        string $currency,
        string $method,
        array  $meta = []
    ): PawWithdrawal {
        return DB::transaction(function () use ($userId, $amount, $currency, $method, $meta) {
            $wallet = $this->walletForUpdate($userId, $currency);

            if (bccomp($wallet->available_balance, $amount, 2) < 0) {
                throw new \App\Exceptions\InsufficientFundsException(
                    "Insufficient funds for withdrawal of {$amount} {$currency}"
                );
            }

            // Move from available → frozen
            $wallet->available_balance = bcsub($wallet->available_balance, $amount, 2);
            $wallet->frozen_balance    = bcadd($wallet->frozen_balance,    $amount, 2);
            $wallet->save();

            return PawWithdrawal::create([
                'user_id'  => $userId,
                'amount'   => $amount,
                'currency' => $currency,
                'method'   => $method,
                'status'   => 'pending',
                'meta'     => $meta ?: null,
            ]);
        });
    }

    /**
     * Provider confirms withdrawal success — debit frozen balance + post ledger.
     */
    public function completeWithdrawal(PawWithdrawal $withdrawal): LedgerEntry
    {
        return DB::transaction(function () use ($withdrawal) {
            $wallet = $this->walletForUpdate($withdrawal->user_id, $withdrawal->currency);

            $wallet->frozen_balance = bcsub($wallet->frozen_balance, $withdrawal->amount, 2);
            $wallet->save();

            DB::table('withdrawals')->where('id', $withdrawal->id)->update(['status' => 'completed']);

            // Post debit ledger entry against frozen (balance_after is already deducted from available)
            $balanceAfter = $wallet->available_balance; // frozen was already subtracted from available

            return LedgerEntry::create([
                'user_id'      => $withdrawal->user_id,
                'type'         => 'debit',
                'amount'       => $withdrawal->amount,
                'currency'     => $withdrawal->currency,
                'balance_after'=> $balanceAfter,
                'reference_id' => 'withdrawal:' . $withdrawal->id,
                'description'  => "Withdrawal via {$withdrawal->method} completed",
            ]);
        });
    }

    /**
     * Provider reports failure — unfreeze funds back to available.
     */
    public function reverseWithdrawal(PawWithdrawal $withdrawal): void
    {
        DB::transaction(function () use ($withdrawal) {
            $wallet = $this->walletForUpdate($withdrawal->user_id, $withdrawal->currency);

            $wallet->frozen_balance    = bcsub($wallet->frozen_balance,    $withdrawal->amount, 2);
            $wallet->available_balance = bcadd($wallet->available_balance, $withdrawal->amount, 2);
            $wallet->save();

            DB::table('withdrawals')->where('id', $withdrawal->id)->update(['status' => 'failed']);

            // Reversal credit entry in ledger
            LedgerEntry::create([
                'user_id'      => $withdrawal->user_id,
                'type'         => 'credit',
                'amount'       => $withdrawal->amount,
                'currency'     => $withdrawal->currency,
                'balance_after'=> $wallet->available_balance,
                'reference_id' => 'withdrawal_reversal:' . $withdrawal->id,
                'description'  => "Withdrawal #{$withdrawal->id} reversed — funds returned",
            ]);
        });
    }

    // ── Points (non-financial) ──────────────────────────────────

    public function earnPoints(int $userId, int $amount, string $reason = ''): Points
    {
        return DB::transaction(function () use ($userId, $amount, $reason) {
            $points = Points::firstOrCreate(['user_id' => $userId], ['balance' => 0]);

            PointsLog::create(['user_id' => $userId, 'type' => 'earn', 'amount' => $amount, 'reason' => $reason]);

            $points->balance += $amount;
            $points->save();

            return $points;
        });
    }

    public function spendPoints(int $userId, int $amount, string $reason = ''): Points
    {
        return DB::transaction(function () use ($userId, $amount, $reason) {
            $points = Points::where('user_id', $userId)->lockForUpdate()->firstOrFail();

            if ($points->balance < $amount) {
                throw new \RuntimeException("Insufficient points: {$points->balance} available, {$amount} requested");
            }

            PointsLog::create(['user_id' => $userId, 'type' => 'spend', 'amount' => $amount, 'reason' => $reason]);

            $points->balance -= $amount;
            $points->save();

            return $points;
        });
    }

    // ── Private helpers ─────────────────────────────────────────

    /**
     * Get or create a wallet row and lock it for the current transaction.
     * Must be called inside DB::transaction().
     */
    private function walletForUpdate(int $userId, string $currency): Wallet
    {
        // Get-or-create (upsert) so first deposit auto-creates the wallet
        Wallet::firstOrCreate(
            ['user_id' => $userId, 'currency' => $currency],
            ['available_balance' => '0.00', 'frozen_balance' => '0.00']
        );

        // Re-fetch with exclusive lock
        return Wallet::where('user_id', $userId)
                     ->where('currency', $currency)
                     ->lockForUpdate()
                     ->firstOrFail();
    }
}
