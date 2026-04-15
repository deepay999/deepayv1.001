<?php

namespace App\Services\Finance;

use App\Models\LedgerAccount;
use App\Models\LedgerEntry;
use App\Models\LedgerTransaction;
use App\Models\WalletBalance;
use App\Services\Finance\Idempotency\IdempotencyService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class WalletService
{
    private IdempotencyService $idempotencyService;

    public function __construct(IdempotencyService $idempotencyService)
    {
        $this->idempotencyService = $idempotencyService;
    }

    public function credit(string $accountType, ?int $ownerId, string $currency, string $amount, string $idempotencyKey, array $context = []): LedgerTransaction
    {
        return $this->runIdempotentLedgerOperation($idempotencyKey, 'wallet.credit', $context, function () use ($accountType, $ownerId, $currency, $amount, $idempotencyKey, $context) {
            return DB::transaction(function () use ($accountType, $ownerId, $currency, $amount, $idempotencyKey, $context) {
                $account = $this->resolveAccount($accountType, $ownerId, $currency, $context['account_code'] ?? null);

                $ledgerTransaction = $this->createLedgerTransaction('wallet.credit', $idempotencyKey, $context);

                $entry = $ledgerTransaction->entries()->create([
                    'ledger_account_id' => $account->id,
                    'entry_side' => 'debit',
                    'amount' => $amount,
                    'currency' => $currency,
                    'reference_code' => $context['reference_code'] ?? null,
                    'external_reference' => $context['external_reference'] ?? null,
                    'idempotency_key' => $idempotencyKey,
                    'event_type' => $context['event_type'] ?? 'wallet.credit.posted',
                    'posted_at' => now(),
                    'metadata' => $context['metadata'] ?? null,
                ]);

                $this->applyEntryToProjection($account, $entry);

                return $ledgerTransaction->fresh('entries');
            });
        });
    }

    public function debit(string $accountType, ?int $ownerId, string $currency, string $amount, string $idempotencyKey, array $context = []): LedgerTransaction
    {
        return $this->runIdempotentLedgerOperation($idempotencyKey, 'wallet.debit', $context, function () use ($accountType, $ownerId, $currency, $amount, $idempotencyKey, $context) {
            return DB::transaction(function () use ($accountType, $ownerId, $currency, $amount, $idempotencyKey, $context) {
                $account = $this->resolveAccount($accountType, $ownerId, $currency, $context['account_code'] ?? null);
                $projection = $this->lockProjectionForAccount($account);

                if ((float) $projection->available_balance < (float) $amount) {
                    throw new RuntimeException('Insufficient projected balance');
                }

                $ledgerTransaction = $this->createLedgerTransaction('wallet.debit', $idempotencyKey, $context);

                $entry = $ledgerTransaction->entries()->create([
                    'ledger_account_id' => $account->id,
                    'entry_side' => 'credit',
                    'amount' => $amount,
                    'currency' => $currency,
                    'reference_code' => $context['reference_code'] ?? null,
                    'external_reference' => $context['external_reference'] ?? null,
                    'idempotency_key' => $idempotencyKey,
                    'event_type' => $context['event_type'] ?? 'wallet.debit.posted',
                    'posted_at' => now(),
                    'metadata' => $context['metadata'] ?? null,
                ]);

                $this->applyEntryToProjection($account, $entry, $projection);

                return $ledgerTransaction->fresh('entries');
            });
        });
    }

    public function transfer(string $fromAccountType, ?int $fromOwnerId, string $toAccountType, ?int $toOwnerId, string $currency, string $amount, string $idempotencyKey, array $context = []): LedgerTransaction
    {
        return $this->runIdempotentLedgerOperation($idempotencyKey, 'wallet.transfer', $context, function () use ($fromAccountType, $fromOwnerId, $toAccountType, $toOwnerId, $currency, $amount, $idempotencyKey, $context) {
            return DB::transaction(function () use ($fromAccountType, $fromOwnerId, $toAccountType, $toOwnerId, $currency, $amount, $idempotencyKey, $context) {
                $fromAccount = $this->resolveAccount($fromAccountType, $fromOwnerId, $currency, $context['from_account_code'] ?? null);
                $toAccount = $this->resolveAccount($toAccountType, $toOwnerId, $currency, $context['to_account_code'] ?? null);

                $fromProjection = $this->lockProjectionForAccount($fromAccount);
                $toProjection = $this->lockProjectionForAccount($toAccount);

                if ((float) $fromProjection->available_balance < (float) $amount) {
                    throw new RuntimeException('Insufficient projected balance');
                }

                $ledgerTransaction = $this->createLedgerTransaction('wallet.transfer', $idempotencyKey, $context);

                $creditEntry = $ledgerTransaction->entries()->create([
                    'ledger_account_id' => $fromAccount->id,
                    'entry_side' => 'credit',
                    'amount' => $amount,
                    'currency' => $currency,
                    'reference_code' => $context['reference_code'] ?? null,
                    'external_reference' => $context['external_reference'] ?? null,
                    'idempotency_key' => $idempotencyKey,
                    'event_type' => $context['event_type'] ?? 'wallet.transfer.posted',
                    'posted_at' => now(),
                    'metadata' => array_merge($context['metadata'] ?? [], ['leg' => 'out']),
                ]);

                $debitEntry = $ledgerTransaction->entries()->create([
                    'ledger_account_id' => $toAccount->id,
                    'entry_side' => 'debit',
                    'amount' => $amount,
                    'currency' => $currency,
                    'reference_code' => $context['reference_code'] ?? null,
                    'external_reference' => $context['external_reference'] ?? null,
                    'idempotency_key' => $idempotencyKey,
                    'event_type' => $context['event_type'] ?? 'wallet.transfer.posted',
                    'posted_at' => now(),
                    'metadata' => array_merge($context['metadata'] ?? [], ['leg' => 'in']),
                ]);

                $this->applyEntryToProjection($fromAccount, $creditEntry, $fromProjection);
                $this->applyEntryToProjection($toAccount, $debitEntry, $toProjection);

                return $ledgerTransaction->fresh('entries');
            });
        });
    }

    public function settleIncomingDeposit(string $accountType, ?int $ownerId, string $currency, string $amount, string $idempotencyKey, array $context = []): LedgerTransaction
    {
        return $this->runIdempotentLedgerOperation($idempotencyKey, 'wallet.deposit.settle', $context, function () use ($accountType, $ownerId, $currency, $amount, $idempotencyKey, $context) {
            return DB::transaction(function () use ($accountType, $ownerId, $currency, $amount, $idempotencyKey, $context) {
                $destinationAccount = $this->resolveAccount($accountType, $ownerId, $currency, $context['account_code'] ?? null);
                $settlementAccount = $this->resolveAccount(
                    'system',
                    null,
                    $currency,
                    $context['settlement_account_code'] ?? config('finance.system_accounts.settlement_clearing')
                );

                $destinationProjection = $this->lockProjectionForAccount($destinationAccount);
                $settlementProjection = $this->lockProjectionForAccount($settlementAccount);

                $ledgerTransaction = $this->createLedgerTransaction('wallet.deposit.settle', $idempotencyKey, $context);

                $settlementEntry = $ledgerTransaction->entries()->create([
                    'ledger_account_id' => $settlementAccount->id,
                    'entry_side' => 'credit',
                    'amount' => $amount,
                    'currency' => $currency,
                    'reference_code' => $context['reference_code'] ?? null,
                    'external_reference' => $context['external_reference'] ?? null,
                    'idempotency_key' => $idempotencyKey,
                    'event_type' => $context['settlement_event_type'] ?? 'deposit.settlement.clearing',
                    'posted_at' => now(),
                    'metadata' => array_merge($context['metadata'] ?? [], ['leg' => 'settlement_source']),
                ]);

                $walletEntry = $ledgerTransaction->entries()->create([
                    'ledger_account_id' => $destinationAccount->id,
                    'entry_side' => 'debit',
                    'amount' => $amount,
                    'currency' => $currency,
                    'reference_code' => $context['reference_code'] ?? null,
                    'external_reference' => $context['external_reference'] ?? null,
                    'idempotency_key' => $idempotencyKey,
                    'event_type' => $context['event_type'] ?? 'deposit.posted',
                    'posted_at' => now(),
                    'metadata' => array_merge($context['metadata'] ?? [], ['leg' => 'wallet_destination']),
                ]);

                $this->applyEntryToProjection($settlementAccount, $settlementEntry, $settlementProjection);
                $this->applyEntryToProjection($destinationAccount, $walletEntry, $destinationProjection);

                return $ledgerTransaction->fresh('entries');
            });
        });
    }

    public function getOrCreateSystemAccount(string $accountCode, string $currency): LedgerAccount
    {
        return $this->resolveAccount('system', null, $currency, $accountCode);
    }

    private function runIdempotentLedgerOperation(string $idempotencyKey, string $operationType, array $context, callable $callback): LedgerTransaction
    {
        $reservation = $this->idempotencyService->reserve($idempotencyKey, $operationType, $context + ['payload' => $context['payload'] ?? []]);

        if ($reservation['replay'] ?? false) {
            return LedgerTransaction::query()->findOrFail($reservation['resource_id']);
        }

        try {
            $ledgerTransaction = $callback();

            $this->idempotencyService->complete(
                $reservation['record'],
                LedgerTransaction::class,
                $ledgerTransaction->id,
                ['transaction_uuid' => $ledgerTransaction->transaction_uuid]
            );

            return $ledgerTransaction;
        } catch (Throwable $exception) {
            $this->idempotencyService->fail(
                $reservation['record'],
                ['message' => $exception->getMessage()],
                422,
                true
            );

            throw $exception;
        }
    }

    private function resolveAccount(string $accountType, ?int $ownerId, string $currency, ?string $accountCode = null): LedgerAccount
    {
        if ($accountType === 'system' && !$accountCode) {
            throw new RuntimeException('System account requires account_code');
        }

        $attributes = [
            'account_type' => $accountType,
            'owner_id' => $ownerId,
            'currency' => $currency,
            'account_code' => $accountCode,
        ];

        return LedgerAccount::query()->firstOrCreate(
            $attributes,
            ['status' => 'active']
        );
    }

    private function createLedgerTransaction(string $eventType, string $idempotencyKey, array $context): LedgerTransaction
    {
        return LedgerTransaction::query()->create([
            'transaction_uuid' => (string) Str::uuid(),
            'event_type' => $eventType,
            'reference_type' => $context['reference_type'] ?? null,
            'reference_id' => $context['reference_id'] ?? null,
            'idempotency_key' => $idempotencyKey,
            'status' => $context['status'] ?? 'posted',
            'metadata' => $context['metadata'] ?? null,
        ]);
    }

    private function applyEntryToProjection(LedgerAccount $account, LedgerEntry $entry, ?WalletBalance $projection = null): void
    {
        $projection ??= $this->lockProjectionForAccount($account);

        $availableBalance = (float) $projection->available_balance;
        $delta = (float) $entry->amount;

        if ($entry->entry_side === 'debit') {
            $availableBalance += $delta;
        } else {
            $availableBalance -= $delta;
        }

        $projection->forceFill([
            'available_balance' => number_format($availableBalance, 8, '.', ''),
            'last_ledger_entry_id' => $entry->id,
        ])->save();
    }

    private function lockProjectionForAccount(LedgerAccount $account): WalletBalance
    {
        $projection = WalletBalance::query()->firstOrCreate([
            'account_type' => $account->account_type,
            'owner_id' => $account->owner_id,
            'account_code' => $account->account_code,
            'currency' => $account->currency,
        ]);

        return WalletBalance::query()->whereKey($projection->id)->lockForUpdate()->firstOrFail();
    }
}