# DeePay Backend Finance Worklog

Last updated: 2026-04-15

Detailed design documents:
- docs/idempotency-engine-design.md
- docs/ledger-system-accounts-design.md
- docs/reconciliation-design.md
- docs/payment-state-machine-design.md
- docs/webhook-trust-design.md
- docs/external-ledger-and-settlement-design.md
- docs/withdrawal-protection-and-risk-design.md
- docs/swan-mcp-setup.md

## Purpose

This document is the persistent engineering worklog for backend wallet, ledger, webhook, and reconciliation work in this repository.

Rule for future work in this repo:
- Record backend finance decisions here before or while implementing them.
- Treat this file as the running handoff so future sessions do not restart from zero.
- Keep architecture principles stable unless explicitly changed.

## Confirmed Architecture Direction

The target architecture is:

User Action
-> API Layer
-> Idempotency Engine
-> WalletService
-> Ledger (truth)
-> Wallet Cache (view)
-> Reconciliation Job

Engineering principles already agreed:
- Ledger-first: all money movement must land in ledger entries first.
- Event-driven: webhook, transfer, payout, and payout status changes write money state through events or event-like handlers.
- Wallet is a view: wallet balance is a cache or projection derived from ledger, not the source of truth.

## Canonical Runtime Structure

The current agreed target runtime path is:

Webhook
-> API Controller
-> WalletService
-> Ledger (truth)
-> Wallet Cache

Interpretation:
- webhook or API is only the ingress layer
- WalletService is the only money-mutation orchestration layer
- ledger remains the accounting truth
- wallet cache is only a fast read projection

This means future funding integrations such as Swan and Airwallex should terminate in WalletService rather than writing balances directly.

## What Exists Today

Current backend state observed in Laravel app under core:

- User balance is currently stored directly on users.balance.
- Business flows write Transaction rows and update user or agent balances directly.
- Deposit success is handled through gateway process controllers and PaymentController.
- Authorized transaction flows use temporary records and flags such as is_used for partial replay protection.
- Cron infrastructure exists through CronController, CronJob, CronSchedule, and CronJobLog.
- Fee configuration exists in TransactionCharge, but there is no clear platform or system ledger account receiving those fees.

Relevant code areas already identified:
- core/app/Http/Controllers/Gateway/PaymentController.php
- core/app/Lib/AuthorizedTransactions/
- core/app/Traits/CashOutOperation.php
- core/app/Models/Transaction.php
- core/app/Models/User.php
- core/app/Models/Deposit.php
- core/routes/ipn.php
- core/routes/user.php

## Gaps That Must Be Closed Before Financial-Grade Operation

### 1. Idempotency Engine

Problem:
- webhook retry can re-enter money code
- API replay can trigger duplicate ledger writes
- transfer and withdrawal calls do not yet have a single hardened idempotency contract

Required standard:
- Every money-related request must carry an idempotency_key.
- idempotency_key must be unique at storage level.
- If the same key is seen again, return the original result instead of writing money again.

Must cover:
- Airwallex webhook
- Swan webhook
- transfer API
- withdrawal API
- any future top-up, payout, refund, reversal, or settlement endpoint

### 2. System Ledger Account

Problem:
- fees have no canonical financial destination
- FX spread, reserve movement, and frozen funds cannot be explained cleanly
- reconciliation will fail once multiple money buckets exist

Required standard:
- Introduce a system account with a stable internal identifier.
- For the current model, the agreed placeholder is user_id = 0 or another explicit system account identity.

System account usage:
- platform fees
- FX income or spread
- risk hold or frozen funds
- manual adjustment reserve
- reconciliation adjustment entries, if ever required by controlled process

### 3. Balance Reconciliation

Problem:
- wallet-style balance fields are mutable cache today
- ledger is intended truth, but not yet enforced as truth
- drift between cache and ledger will create invisible money errors

Required layered design:

Layer 1: real-time projection
- write ledger
- synchronously update wallet cache or current balance projection

Layer 2: periodic repair
- scheduled job recalculates wallet balance from ledger
- baseline cadence: every 10 minutes

Layer 3: audit
- diff report between wallet cache and ledger aggregation
- record mismatches for operator review

## Engineering Definition For Next Upgrade

### WalletService

Target responsibilities:
- enforce idempotency before money mutation
- open one DB transaction per financial command
- write balanced ledger entries
- update wallet projection or cached balance
- emit domain event for downstream notifications or settlement processing

Non-goals:
- no controller should directly mutate users.balance for money logic once migration is complete
- no webhook should bypass idempotency checks

### Ledger Model

Target outcome:
- all debit and credit movements represented in a dedicated ledger table
- every business command has a stable reference id
- fees, principal, reserve, adjustment, and reversal are separable entry types

Recommended minimum columns for future implementation:
- id
- account_type
- account_id
- counterparty_account_type
- counterparty_account_id
- direction
- amount
- currency
- reference_type
- reference_id
- idempotency_key
- external_reference
- event_type
- metadata
- created_at

### Wallet Projection

Target outcome:
- wallet balance becomes a fast read model
- if projection is wrong, reconciliation can recompute it from ledger

## Current Priority Order

Recommended implementation order:

1. Introduce persistent documentation and handoff discipline.
2. Build idempotency storage and middleware or service support for money endpoints.
3. Introduce system account model or convention and route all fees there.
4. Add ledger_entries table and a minimal WalletService for one or two critical flows.
5. Add reconciliation command and scheduled drift report.

## Decision Log

### 2026-04-15

Confirmed with user:
- ledger-first is the correct direction
- event-driven money handling is the correct direction
- wallet must be treated as a view, not source of truth
- three mandatory production-grade systems are idempotency engine, system ledger account, and reconciliation
- all future backend finance work should be written into documentation to avoid restarting from scratch

### 2026-04-15 Repository Findings

Observed risks in current codebase:
- duplicated webhook handling is only partially protected by status checks and temporary flags
- there is no explicit system account for fee capture
- reconciliation job for wallet versus truth is not present
- Transaction is still a business activity log, not a proper double-entry ledger

### 2026-04-15 Design Docs Added

Added persistent design documents for:
- idempotency engine
- ledger plus system account model
- reconciliation and wallet projection repair

These docs are the baseline for future schema work, WalletService implementation, webhook hardening, and financial event rollout.

### 2026-04-15 WalletService Direction Confirmed

User provided and confirmed the desired financial-grade WalletService direction:
- all money changes must go through WalletService
- WalletService must enforce idempotency
- WalletService must use row locking or equivalent concurrency control
- WalletService must write ledger first and treat wallet as cache
- webhook, transfer, payout, and future bank integrations must call WalletService instead of mutating balances directly

This is considered the core engine direction for the repository.

### 2026-04-15 Production-Readiness Gap Upgrade

User clarified that a correct WalletService alone is not enough for real-money production operation.

Additional mandatory layers now explicitly recorded:
- transaction lifecycle state machine
- external ledger and settlement reconciliation layer
- trusted webhook verification system
- withdrawal protection chain with freeze and finalize flow
- AML-lite or basic risk scoring engine
- event store or non-lossy financial event log

Interpretation for this repository:
- WalletService should be treated as a financial transaction orchestrator, not a thin helper service
- internal ledger truth must be paired with external provider truth when Swan or Airwallex are integrated
- direct instant credit or debit semantics are not enough for real bank flows; lifecycle states must exist

### 2026-04-15 Maturity Assessment

User expectation and agreed benchmark:
- if implemented correctly, this WalletService pattern reaches the core ledger-engine level expected in modern fintech stacks
- the benchmark named in discussion was Revolut or Wise style core ledger MVP, meaning not full enterprise scope, but the right accounting spine

This assessment should be read as architectural direction, not as a claim that the current repository already has full production-grade coverage.

### 2026-04-15 Minimum Backend Scaffold Implemented

The first additive finance scaffold has now been committed into the Laravel codebase under core.

Implemented files:
- core/config/finance.php
- core/database/migrations/2026_04_15_160000_create_idempotency_keys_table.php
- core/database/migrations/2026_04_15_160100_create_ledger_accounts_table.php
- core/database/migrations/2026_04_15_160200_create_ledger_transactions_table.php
- core/database/migrations/2026_04_15_160300_create_ledger_entries_table.php
- core/database/migrations/2026_04_15_160400_create_wallet_balances_table.php
- core/app/Models/IdempotencyKey.php
- core/app/Models/LedgerAccount.php
- core/app/Models/LedgerTransaction.php
- core/app/Models/LedgerEntry.php
- core/app/Models/WalletBalance.php
- core/app/Services/Finance/Idempotency/IdempotencyService.php
- core/app/Services/Finance/WalletService.php
- core/app/Services/Finance/Reconciliation/WalletReconciliationService.php
- core/app/Console/Commands/Finance/ReconcileWalletsCommand.php

What this scaffold provides:
- persistent idempotency storage and request hash enforcement
- explicit ledger account, transaction, and entry models
- wallet projection table for additive balance-view migration
- WalletService methods for credit, debit, and transfer orchestration
- reconciliation service to compare wallet projection against ledger truth
- finance:reconcile-wallets artisan command for targeted or repair-mode reconciliation

Validation completed:
- php8.3 artisan list confirms finance:reconcile-wallets is registered
- syntax validation passed for new finance services, models, and command after constructor compatibility fix

Compatibility note:
- repository requires PHP 8.3 for runtime validation
- default shell php in this environment was older, so validation must use /usr/bin/php8.3

Current limitation of this phase:
- scaffold is additive and not yet wired into existing deposit, withdrawal, or webhook production flows
- existing business controllers may still mutate balance fields directly until migration into WalletService is performed

Affected layers:
- ledger truth: yes
- wallet view: yes
- reconciliation: yes

### 2026-04-15 Webhook Deposit Settlement MVP Implemented

The first webhook-to-ledger deposit loop is now wired into the backend as an additive MVP.

Implemented pieces:
- public webhook endpoints added for Swan and Airwallex
- webhook controller verifies HMAC-style signature when webhook_secret is configured
- webhook payload is mapped to a deposit reference and success status
- successful deposit settlement now enters DepositSettlementService
- DepositSettlementService calls WalletService first, writes paired ledger entries, updates wallet projection, then mirrors legacy balance and Transaction history
- PaymentController::userDataUpdate now delegates to DepositSettlementService instead of directly mutating balances first

Implemented files:
- core/app/Http/Controllers/Webhooks/BankingWebhookController.php
- core/app/Services/Finance/DepositSettlementService.php
- core/app/Services/Finance/WalletService.php
- core/app/Http/Controllers/Gateway/PaymentController.php
- core/routes/web.php
- core/bootstrap/app.php

Operational note:
- route:list verification is currently blocked by an unrelated pre-existing missing controller class in admin routes: App\Http\Controllers\Admin\MobileOperatorController
- this is not caused by the new webhook code, but it prevents artisan from printing the full route table until that separate issue is fixed

Current behavior of the MVP:
- duplicate webhook settlement is blocked by idempotency key deposit:settlement:{trx}
- successful deposit writes a clearing credit and destination wallet debit in ledger
- wallet projection is updated in the same transaction boundary
- legacy user.balance or agent.balance is then synchronized from wallet projection for compatibility

Current limitation of the MVP:
- signature verification uses configured webhook_secret plus HMAC-SHA256 and may need provider-specific adjustment once real Swan or Airwallex signed payload samples are available
- payload mapping is generic and should be hardened against actual provider event schemas once credentials and test events are supplied

### 2026-04-15 Airwallex Backend Integration Services Added

To prepare for real credentials and platform-level BaaS integration, Airwallex service classes were added.

Implemented files:
- core/app/Services/Airwallex/AirwallexClient.php
- core/app/Services/Airwallex/AirwallexConnectedAccountService.php

Capabilities added:
- login to Airwallex using client_id plus api_key
- cache and auto-refresh access token before expiry
- create connected account via /accounts/create
- call global account and conversion APIs with x-on-behalf-of support for connected accounts

This means the backend now has the service-layer foundation for:
- platform authentication
- connected account creation
- representing customer operations through x-on-behalf-of
- extending into global accounts, conversions, and payout flows later

### 2026-04-15 Webhook Trust Persistence And Replay Guards Added

The banking webhook ingress layer was hardened beyond basic signature checking.

Implemented files:
- core/app/Http/Controllers/Webhooks/BankingWebhookController.php
- core/app/Models/FinancialWebhookEvent.php
- core/app/Services/Finance/Webhooks/BankingWebhookSupport.php
- core/app/Services/Finance/Webhooks/FinancialWebhookEventService.php
- core/database/migrations/2026_04_15_161000_create_financial_webhook_events_table.php
- core/config/finance.php
- core/tests/Unit/BankingWebhookSupportTest.php

What changed:
- inbound financial webhooks are now durably recorded in financial_webhook_events
- provider plus event_id uniqueness is enforced to block duplicate event replay
- payload hash mismatch on same provider plus event_id is treated as a conflict signal
- webhook timestamp freshness is enforced when provider payload includes a timestamp
- gateway webhook parameters now correctly read nested admin config values like webhook_secret.value
- verified events continue into DepositSettlementService only after trust checks pass

Current behavior of this phase:
- invalid signatures are rejected and stored as rejected events
- duplicate events with identical payload are accepted without replaying settlement logic
- stale timestamps are rejected when present and outside finance.webhooks.max_skew_seconds
- missing timestamps are still tolerated for compatibility until provider-specific contracts are finalized

Current limitation of this phase:
- event processing exceptions outside the explicit accepted or ignored paths can still leave an event in processing status for manual investigation
- timestamp extraction and event_id extraction are generic and should be refined again once real Swan and Airwallex production samples are captured

## Working Rules For Future Sessions

When continuing backend finance work in this repository:
- Read this file first.
- Do not introduce direct balance mutation in new money code unless it is inside a controlled transitional service.
- Prefer additive migration toward ledger rather than risky big-bang replacement.
- Add new findings under Decision Log with date.
- Add implementation checkpoints under the section below as work progresses.

## Implementation Checkpoints

Completed checkpoints:
- Defined idempotency table schema and initial service contract. See docs/idempotency-engine-design.md.
- Defined system account storage strategy in config and ledger account model direction. See docs/ledger-system-accounts-design.md.
- Added initial ledger_transactions and ledger_entries schema. See docs/ledger-system-accounts-design.md.
- Added wallet projection table and reconciliation refresh service skeleton. See docs/reconciliation-design.md.
- Added reconciliation command entrypoint and repair-mode option. See docs/reconciliation-design.md.

Pending checkpoints:
- Migrate one real production money flow into WalletService, starting with deposit settlement or trusted webhook settlement.
- Introduce command or seeder for canonical system ledger accounts across currencies.
- Add reconciliation diff persistence and operator-facing report output.
- Replace direct balance mutation in critical flows with ledger plus projection writes.

## Session Update Rule

For every meaningful backend finance session after 2026-04-15:
- append the actual change made
- append the exact files touched
- append any migration or rollback concern
- append whether the change affected ledger truth, wallet view, or reconciliation

## Recommended Next Upgrade Tracks

The next major tracks already identified and approved for future continuation are:

1. webhook defense and anti-replay hardening
2. AML-lite or basic risk scoring engine
3. end-to-end Swan and Airwallex money flow integration
4. transaction state machine documentation and implementation path, such as pending -> confirmed -> settled or reversed

Expanded production-readiness track list:

5. external ledger and settlement truth layer
6. withdrawal intent and frozen-funds protection chain
7. non-lossy event store for financial events

These should be treated as downstream layers built on top of the WalletService, idempotency, ledger, and reconciliation foundations.

---

## 2026-04-15 Webhook → WalletService Inbound Money Chain Complete

### Summary

The full inbound deposit chain is now end-to-end functional:

```
Webhook POST → Signature Verify → Event Store (deduplicate) → Timestamp Freshness
  → Deposit Lookup → DepositSettlementService → WalletService::settleIncomingDeposit
  → LedgerTransaction (double-entry) → WalletBalance projection → User.balance sync
  → Transaction record → AdminNotification
```

### Changes Made

1. **Migration fix** — `2026_04_15_161000_create_financial_webhook_events_table.php`: shortened composite index name (`fwe_linked_ref_index`) to avoid MySQL 64-char identifier limit.

2. **Settlement exception guard** — `BankingWebhookController.php`: wrapped `settle()` call in try/catch. On failure, marks the webhook event as `rejected` with the error message instead of leaving it stuck in `processing` status. Returns HTTP 500 to the provider so they retry.

3. **Database migrations executed** — All 6 finance tables now exist in production DB:
   - `idempotency_keys`
   - `ledger_accounts`
   - `ledger_transactions`
   - `ledger_entries`
   - `wallet_balances`
   - `financial_webhook_events`

4. **Feature test** — `tests/Feature/WebhookDepositSettlementTest.php`: 3 tests, 27 assertions.
   - `test_swan_webhook_settles_deposit_end_to_end`: Verifies full chain from HTTP POST through to ledger entries, wallet balance, user balance, and transaction record.
   - `test_duplicate_webhook_returns_202_without_double_settlement`: Confirms replay protection — second identical webhook returns 202 with no duplicate ledger entries.
   - `test_invalid_signature_returns_401`: Confirms bad signatures are rejected and event is marked `rejected`.

### Verified Behaviors

| Scenario | HTTP | Ledger Result |
|---|---|---|
| Valid webhook, matching deposit | 200 | 2 entries (debit user + credit settlement) |
| Replay (same event_id + payload) | 202 | No additional entries |
| Invalid signature | 401 | Event stored as `rejected` |
| Settlement exception | 500 | Event marked `rejected` with error |

### Test Command

```bash
cd core && /usr/bin/php8.3 artisan test tests/Feature/WebhookDepositSettlementTest.php
# 3 passed, 27 assertions, 0.44s
```
