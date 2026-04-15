# DeePay Reconciliation Design

Last updated: 2026-04-15

## Goal

Ensure displayed wallet balances remain consistent with ledger truth.

Reconciliation is the safety net that detects and repairs drift caused by:
- partial failures
- historical direct balance mutation
- duplicate or missed webhook handling
- manual admin edits
- migration-phase bugs

For real-money operation, reconciliation must compare three views of money:
- internal ledger truth
- external provider or bank truth
- wallet cache or projection truth shown to product and users

## Three-Layer Model

### Layer 1: Real-Time Projection

For every successful money command:
- write ledger entries
- update wallet cache or balance projection in same DB transaction

This is the primary path.

### Layer 2: Scheduled Repair

Run periodic recalculation from ledger.

Baseline target:
- every 10 minutes recalculate wallet balance from ledger totals

Purpose:
- repair drift if projection update failed
- catch historical inconsistencies during migration

### Layer 3: Audit And Diff Reporting

Produce a diff report between:
- wallet view balance
- ledger-derived expected balance

Purpose:
- operator visibility
- alerting
- postmortem support

## Reconciliation Targets

Must reconcile at least:
- user balances
- agent balances
- merchant balances
- system fee accounts
- system reserve accounts

When Swan or Airwallex are active, must also reconcile:
- provider transfer state
- provider payout state
- provider inbound funding events
- external statement lines or settlement exports

## Data Sources

### Truth Source

ledger_entries aggregated by ledger account

### External Truth Source

When external providers are integrated:
- Swan statement or payout export
- Airwallex balance and transfer events
- webhook event store records
- settlement files or statement snapshots

### View Source

During transition:
- users.balance
- agents.balance
- merchants.balance

After wallet projection table exists:
- wallet_balances.available_balance
- wallet_balances.pending_balance
- wallet_balances.reserved_balance

## Command Design

Recommended console commands:
- php artisan finance:reconcile-wallets
- php artisan finance:reconcile-wallets --entity=user --owner-id=123
- php artisan finance:reconcile-wallets --repair
- php artisan finance:reconcile-report

Recommended classes:
- App\Console\Commands\Finance\ReconcileWalletsCommand
- App\Services\Finance\Reconciliation\WalletReconciliationService
- App\Services\Finance\Reconciliation\WalletRepairService

## Reconciliation Algorithm

For each ledger account:

1. aggregate ledger balance
2. load current wallet or balance cache
3. compare values within allowed precision rule
4. if mismatch exists, write diff record
5. if repair mode is enabled and policy allows, update wallet projection to ledger total

Precision rule:
- compare using currency precision
- do not compare raw floating point values
- use decimal math only

## Diff Storage

Recommended table: reconciliation_diffs

Minimum columns:
- id
- run_uuid
- ledger_account_id
- account_type
- owner_id unsigned bigint nullable
- currency
- wallet_balance decimal(24, 8)
- ledger_balance decimal(24, 8)
- diff_amount decimal(24, 8)
- severity string
- repaired boolean default false
- repaired_at timestamp nullable
- metadata json nullable
- created_at
- updated_at

Recommended severities:
- info
- warning
- critical

Recommended queue actions from diff output:
- auto_correction_queue
- manual_review_queue
- provider_followup_queue

## Repair Policy

Default repair behavior:
- user and agent wallet caches may be auto-repaired from ledger totals
- system accounts should never be silently adjusted outside explicit repair log
- if diff exceeds threshold, require operator review before repair

Threshold examples:
- zero-tolerance for system accounts
- low threshold for user accounts
- different threshold by currency if needed

## Reporting

Each run should output:
- total accounts scanned
- total accounts mismatched
- total absolute diff by currency
- top critical mismatches
- repair count

Provider-aware reporting should also output:
- external events missing from internal ledger
- internal posted entries not found in external provider truth
- wallet cache mismatches after provider truth is accepted
- unmatched pending withdrawals and deposits by age bucket

Recommended operator views later:
- admin reconciliation dashboard
- downloadable CSV report
- alert notification for critical diffs

## Scheduling

Baseline scheduling recommendation:
- every 10 minutes run fast reconciliation
- daily run full report across all accounts
- monthly run deep audit summary including system accounts and fee buckets

For current codebase, this should integrate with existing cron infrastructure after console command is stable.

## Migration-Phase Notes

Because current code mutates balances directly, early reconciliation will likely find historical drift.

Practical rule during migration:
- first use report-only mode
- measure drift patterns
- then enable controlled repair for the most stable migrated flows

## Acceptance Criteria

Reconciliation is acceptable only if:
- wallet balances can be recalculated from ledger deterministically
- scheduled job detects drift without manual SQL work
- repair mode can restore projection safely
- system account drift is reported explicitly
- every run leaves an auditable record