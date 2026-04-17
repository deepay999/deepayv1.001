<?php

namespace App\Services;

use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

/**
 * LedgerService
 *
 * All money movements MUST go through this service.
 * Entries are immutable once created.
 */
class LedgerService {

    const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'];

    /**
     * Credit a user's wallet (increase balance).
     *
     * @param  int         $userId
     * @param  string      $currency   EUR | USD | GBP
     * @param  float       $amount     Positive amount to add
     * @param  string      $type       e.g. 'deposit', 'transfer_in', 'cashback'
     * @param  string|null $referenceType  e.g. 'send_money', 'airwallex_payment'
     * @param  int|null    $referenceId
     * @param  string|null $description
     * @param  string|null $idempotencyKey  Prevents duplicate entries
     * @return LedgerEntry
     */
    public function credit(
        int $userId,
        string $currency,
        float $amount,
        string $type,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $description = null,
        ?string $idempotencyKey = null
    ): LedgerEntry {
        return $this->record($userId, $currency, abs($amount), 'credit', $type, $referenceType, $referenceId, $description, $idempotencyKey);
    }

    /**
     * Debit a user's wallet (decrease balance).
     */
    public function debit(
        int $userId,
        string $currency,
        float $amount,
        string $type,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $description = null,
        ?string $idempotencyKey = null
    ): LedgerEntry {
        return $this->record($userId, $currency, -abs($amount), 'debit', $type, $referenceType, $referenceId, $description, $idempotencyKey);
    }

    /**
     * Internal P2P transfer: debit sender, credit receiver – atomically.
     *
     * @return array{sender: LedgerEntry, receiver: LedgerEntry}
     */
    public function transfer(
        int $senderId,
        int $receiverId,
        string $currency,
        float $amount,
        string $type = 'p2p_transfer',
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $description = null,
        ?string $idempotencyKey = null
    ): array {
        return DB::transaction(function () use ($senderId, $receiverId, $currency, $amount, $type, $referenceType, $referenceId, $description, $idempotencyKey) {
            $debitKey  = $idempotencyKey ? $idempotencyKey . '_debit'  : null;
            $creditKey = $idempotencyKey ? $idempotencyKey . '_credit' : null;

            $sender   = $this->debit($senderId,   $currency, $amount, $type, $referenceType, $referenceId, $description, $debitKey);
            $receiver = $this->credit($receiverId, $currency, $amount, $type, $referenceType, $referenceId, $description, $creditKey);

            return ['sender' => $sender, 'receiver' => $receiver];
        });
    }

    /**
     * Get the current balance for a user/currency pair (sum of all ledger entries).
     */
    public function getBalance(int $userId, string $currency): float {
        return (float) LedgerEntry::where('user_id', $userId)
            ->where('currency', $currency)
            ->sum('amount');
    }

    /**
     * Get the available balance (total − frozen).
     */
    public function getAvailableBalance(int $userId, string $currency): float {
        $total  = $this->getBalance($userId, $currency);
        $frozen = $this->getFrozenAmount($userId, $currency);

        return max(0, $total - $frozen);
    }

    /**
     * Get the frozen amount for a user/currency pair.
     */
    public function getFrozenAmount(int $userId, string $currency): float {
        $wallet = Wallet::where('user_id', $userId)->where('currency', $currency)->first();

        return $wallet ? (float) $wallet->frozen_amount : 0.0;
    }

    /**
     * Freeze a specific amount in a wallet (e.g., pending withdrawal).
     */
    public function freeze(int $userId, string $currency, float $amount): Wallet {
        return DB::transaction(function () use ($userId, $currency, $amount) {
            $wallet = $this->getOrCreateWallet($userId, $currency);

            if ($this->getAvailableBalance($userId, $currency) < $amount) {
                throw new \RuntimeException('Insufficient available balance to freeze.');
            }

            $wallet->increment('frozen_amount', $amount);

            return $wallet->fresh();
        });
    }

    /**
     * Unfreeze a previously frozen amount.
     */
    public function unfreeze(int $userId, string $currency, float $amount): Wallet {
        return DB::transaction(function () use ($userId, $currency, $amount) {
            $wallet = $this->getOrCreateWallet($userId, $currency);
            $wallet->decrement('frozen_amount', min($amount, $wallet->frozen_amount));

            return $wallet->fresh();
        });
    }

    /**
     * Freeze entire wallet at account level (risk / compliance).
     */
    public function freezeWalletAccount(int $userId): void {
        \App\Models\User::where('id', $userId)->update(['wallet_frozen' => true]);
    }

    /**
     * Unfreeze entire wallet at account level.
     */
    public function unfreezeWalletAccount(int $userId): void {
        \App\Models\User::where('id', $userId)->update(['wallet_frozen' => false]);
    }

    /**
     * Get or create a Wallet row for a user/currency pair.
     */
    public function getOrCreateWallet(int $userId, string $currency): Wallet {
        return Wallet::firstOrCreate(
            ['user_id' => $userId, 'currency' => strtoupper($currency)],
            ['frozen_amount' => 0, 'is_active' => true]
        );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function record(
        int $userId,
        string $currency,
        float $amount,
        string $entryType,
        string $type,
        ?string $referenceType,
        ?int $referenceId,
        ?string $description,
        ?string $idempotencyKey
    ): LedgerEntry {
        $currency = strtoupper($currency);

        if (!in_array($currency, self::SUPPORTED_CURRENCIES, true)) {
            throw new \InvalidArgumentException("Unsupported currency: {$currency}");
        }

        if ($amount == 0) {
            throw new \InvalidArgumentException('Ledger entry amount cannot be zero.');
        }

        // Idempotency: return existing entry if key already used
        if ($idempotencyKey) {
            $existing = LedgerEntry::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
        }

        return DB::transaction(function () use ($userId, $currency, $amount, $entryType, $type, $referenceType, $referenceId, $description, $idempotencyKey) {
            // Ensure wallet row exists
            $this->getOrCreateWallet($userId, $currency);

            // Running balance = previous sum + new amount
            $runningBalance = (float) LedgerEntry::where('user_id', $userId)
                ->where('currency', $currency)
                ->sum('amount') + $amount;

            return LedgerEntry::create([
                'user_id'         => $userId,
                'currency'        => $currency,
                'amount'          => $amount,
                'type'            => $entryType,
                'reference_type'  => $referenceType ?? $type,
                'reference_id'    => $referenceId,
                'description'     => $description,
                'idempotency_key' => $idempotencyKey,
                'running_balance' => $runningBalance,
            ]);
        });
    }
}
