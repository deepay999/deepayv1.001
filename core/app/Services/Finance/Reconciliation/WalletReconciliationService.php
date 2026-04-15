<?php

namespace App\Services\Finance\Reconciliation;

use App\Models\LedgerAccount;
use App\Models\WalletBalance;
use Illuminate\Support\Facades\DB;

class WalletReconciliationService
{
    public function reconcile(?string $accountType = null, ?int $ownerId = null, bool $repair = false): array
    {
        $accountsQuery = LedgerAccount::query();

        if ($accountType) {
            $accountsQuery->where('account_type', $accountType);
        }

        if ($ownerId !== null) {
            $accountsQuery->where('owner_id', $ownerId);
        }

        $accounts = $accountsQuery->get();

        $summary = [
            'scanned' => 0,
            'mismatched' => 0,
            'repaired' => 0,
            'diffs' => [],
        ];

        foreach ($accounts as $account) {
            $summary['scanned']++;

            $ledgerBalance = (string) (DB::table('ledger_entries')
                ->where('ledger_account_id', $account->id)
                ->selectRaw("COALESCE(SUM(CASE WHEN entry_side = 'debit' THEN amount ELSE -amount END), 0) as balance")
                ->value('balance') ?? '0');

            $walletBalance = WalletBalance::query()->firstOrCreate([
                'account_type' => $account->account_type,
                'owner_id' => $account->owner_id,
                'account_code' => $account->account_code,
                'currency' => $account->currency,
            ]);

            $walletAmount = (string) $walletBalance->available_balance;
            $diffAmount = number_format((float) $ledgerBalance - (float) $walletAmount, 8, '.', '');

            if ((float) $diffAmount === 0.0) {
                continue;
            }

            $summary['mismatched']++;

            $diff = [
                'ledger_account_id' => $account->id,
                'account_type' => $account->account_type,
                'owner_id' => $account->owner_id,
                'account_code' => $account->account_code,
                'currency' => $account->currency,
                'wallet_balance' => $walletAmount,
                'ledger_balance' => $ledgerBalance,
                'diff_amount' => $diffAmount,
            ];

            if ($repair) {
                $walletBalance->forceFill([
                    'available_balance' => $ledgerBalance,
                ])->save();
                $summary['repaired']++;
                $diff['repaired'] = true;
            }

            $summary['diffs'][] = $diff;
        }

        return $summary;
    }
}