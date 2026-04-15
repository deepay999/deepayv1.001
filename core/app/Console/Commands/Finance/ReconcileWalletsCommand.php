<?php

namespace App\Console\Commands\Finance;

use App\Services\Finance\Reconciliation\WalletReconciliationService;
use Illuminate\Console\Command;

class ReconcileWalletsCommand extends Command
{
    protected $signature = 'finance:reconcile-wallets
        {--entity= : Limit to one account_type such as user, agent, merchant, or system}
        {--owner-id= : Limit to one owner id}
        {--repair : Update wallet_balances.available_balance from ledger totals}';

    protected $description = 'Compare wallet projections against ledger truth and optionally repair mismatches';

    public function handle(WalletReconciliationService $service): int
    {
        $summary = $service->reconcile(
            $this->option('entity') ?: null,
            $this->option('owner-id') !== null ? (int) $this->option('owner-id') : null,
            (bool) $this->option('repair')
        );

        $this->info('Wallet reconciliation completed');
        $this->line('Scanned: ' . $summary['scanned']);
        $this->line('Mismatched: ' . $summary['mismatched']);
        $this->line('Repaired: ' . $summary['repaired']);

        if ($summary['diffs'] !== []) {
            $this->table(
                ['ledger_account_id', 'account_type', 'owner_id', 'account_code', 'currency', 'wallet_balance', 'ledger_balance', 'diff_amount', 'repaired'],
                array_map(function (array $diff) {
                    return [
                        $diff['ledger_account_id'],
                        $diff['account_type'],
                        $diff['owner_id'],
                        $diff['account_code'],
                        $diff['currency'],
                        $diff['wallet_balance'],
                        $diff['ledger_balance'],
                        $diff['diff_amount'],
                        $diff['repaired'] ?? false,
                    ];
                }, $summary['diffs'])
            );
        }

        return self::SUCCESS;
    }
}