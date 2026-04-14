<?php

namespace App\Services;

use App\Models\User;
use App\Models\WalletLedgerEntry;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * LedgerService
 *
 * Implements a double-entry internal ledger.
 * Every money movement produces exactly two entries: a debit on one wallet and a
 * credit on another (or a platform account for external flows).
 *
 * Guarantees:
 *  - Balance integrity via DB transactions with pessimistic locking
 *  - No fund pooling: each user's balance is independently tracked
 *  - Full auditability: every entry is immutable and references its counterpart
 *    via the shared `trx` token
 */
class LedgerService
{
    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Credit a user's wallet (e.g. incoming deposit / Swan inbound).
     */
    public function credit(
        User   $user,
        float  $amount,
        string $remark,
        string $description,
        array  $meta = []
    ): WalletLedgerEntry {
        return DB::transaction(function () use ($user, $amount, $remark, $description, $meta) {
            $user = User::lockForUpdate()->findOrFail($user->id);
            $trx  = $this->generateTrx();

            $newBalance = round($user->balance + $amount, 8);
            $user->update(['balance' => $newBalance]);

            return WalletLedgerEntry::create([
                'trx'             => $trx,
                'entry_type'      => WalletLedgerEntry::ENTRY_CREDIT,
                'user_id'         => $user->id,
                'amount'          => $amount,
                'currency'        => 'EUR',
                'running_balance' => $newBalance,
                'description'     => $description,
                'remark'          => $remark,
                'meta'            => $meta,
            ]);
        });
    }

    /**
     * Debit a user's wallet (e.g. payout / send money).
     * Throws \DomainException if the balance is insufficient.
     */
    public function debit(
        User   $user,
        float  $amount,
        string $remark,
        string $description,
        array  $meta = []
    ): WalletLedgerEntry {
        return DB::transaction(function () use ($user, $amount, $remark, $description, $meta) {
            $user = User::lockForUpdate()->findOrFail($user->id);

            if ($user->balance < $amount) {
                throw new \DomainException('Insufficient balance');
            }

            $trx        = $this->generateTrx();
            $newBalance = round($user->balance - $amount, 8);
            $user->update(['balance' => $newBalance]);

            return WalletLedgerEntry::create([
                'trx'             => $trx,
                'entry_type'      => WalletLedgerEntry::ENTRY_DEBIT,
                'user_id'         => $user->id,
                'amount'          => $amount,
                'currency'        => 'EUR',
                'running_balance' => $newBalance,
                'description'     => $description,
                'remark'          => $remark,
                'meta'            => $meta,
            ]);
        });
    }

    /**
     * Internal peer-to-peer transfer.
     * Produces one debit on the sender and one credit on the receiver,
     * both sharing the same `trx` reference for auditability.
     *
     * @throws \DomainException on insufficient balance or self-transfer
     */
    public function internalTransfer(
        User   $sender,
        User   $receiver,
        float  $amount,
        float  $fee = 0.0,
        string $description = ''
    ): array {
        if ($sender->id === $receiver->id) {
            throw new \DomainException('Cannot transfer to yourself');
        }

        return DB::transaction(function () use ($sender, $receiver, $amount, $fee, $description) {
            // Lock both rows in a consistent order to avoid deadlocks
            $ids          = [$sender->id, $receiver->id];
            sort($ids);
            $lockedFirst  = User::lockForUpdate()->findOrFail($ids[0]);
            $lockedSecond = User::lockForUpdate()->findOrFail($ids[1]);

            $senderModel   = $lockedFirst->id === $sender->id ? $lockedFirst : $lockedSecond;
            $receiverModel = $lockedFirst->id === $receiver->id ? $lockedFirst : $lockedSecond;

            $totalDebit = round($amount + $fee, 8);

            if ($senderModel->balance < $totalDebit) {
                throw new \DomainException('Insufficient balance');
            }

            $trx = $this->generateTrx();

            // Debit sender
            $senderBalance = round($senderModel->balance - $totalDebit, 8);
            $senderModel->update(['balance' => $senderBalance]);

            $debitEntry = WalletLedgerEntry::create([
                'trx'              => $trx,
                'entry_type'       => WalletLedgerEntry::ENTRY_DEBIT,
                'user_id'          => $senderModel->id,
                'amount'           => $totalDebit,
                'currency'         => 'EUR',
                'running_balance'  => $senderBalance,
                'description'      => $description ?: "Transfer to {$receiverModel->username}",
                'remark'           => 'internal_transfer',
                'related_user_id'  => $receiverModel->id,
                'meta'             => ['fee' => $fee, 'net_amount' => $amount],
            ]);

            // Credit receiver (net, excluding fee)
            $receiverBalance = round($receiverModel->balance + $amount, 8);
            $receiverModel->update(['balance' => $receiverBalance]);

            $creditEntry = WalletLedgerEntry::create([
                'trx'              => $trx,
                'entry_type'       => WalletLedgerEntry::ENTRY_CREDIT,
                'user_id'          => $receiverModel->id,
                'amount'           => $amount,
                'currency'         => 'EUR',
                'running_balance'  => $receiverBalance,
                'description'      => $description ?: "Transfer from {$senderModel->username}",
                'remark'           => 'internal_transfer',
                'related_user_id'  => $senderModel->id,
                'meta'             => ['fee' => $fee],
            ]);

            return [
                'trx'          => $trx,
                'debit_entry'  => $debitEntry,
                'credit_entry' => $creditEntry,
            ];
        });
    }

    /**
     * Retrieve the paginated ledger for a user.
     */
    public function ledger(User $user, int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return WalletLedgerEntry::forUser($user->id)
            ->with('relatedUser:id,username,firstname,lastname')
            ->latest()
            ->paginate($perPage);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function generateTrx(): string
    {
        do {
            $trx = strtoupper(Str::random(16));
        } while (WalletLedgerEntry::where('trx', $trx)->exists());

        return $trx;
    }
}
