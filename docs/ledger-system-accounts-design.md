# DeePay Ledger And System Accounts Design

Last updated: 2026-04-15

## Goal

Move from direct mutable balance updates toward a ledger-first financial model where:
- ledger is the source of truth
- wallet balance is a projection
- system fees and reserves have explicit ownership

## Core Principles

- Every money movement becomes one or more ledger entries.
- Ledger entries are append-only.
- Fees never disappear inside business code; they move into a system account.
- Wallet balances are projections from ledger, not free-form mutable state.

## Accounts Model

### Account Types

Recommended account families:
- user
- agent
- merchant
- system

### System Account Rule

The platform must have explicit system accounts.

Minimum viable approach:
- treat account_type = system
- use stable account_code values rather than only one generic system bucket

Recommended system account codes:
- SYSTEM_FEE_REVENUE
- SYSTEM_FX_REVENUE
- SYSTEM_RISK_HOLD
- SYSTEM_SETTLEMENT_CLEARING
- SYSTEM_MANUAL_ADJUSTMENT
- SYSTEM_RECONCILIATION

Avoid overloading a single account for all platform movements. Separate buckets make audit and reconciliation easier.

## Tables

### ledger_accounts

Recommended columns:
- id
- account_type string
- owner_id unsigned bigint nullable
- account_code string nullable unique
- currency string
- status string
- metadata json nullable
- created_at
- updated_at

Rules:
- user, agent, merchant accounts use owner_id
- system accounts use account_code and null owner_id
- one active primary cash account per entity and currency

### ledger_entries

Recommended columns:
- id
- ledger_account_id unsigned bigint
- entry_side string
- amount decimal(24, 8)
- currency string
- reference_type string
- reference_id unsigned bigint nullable
- reference_code string nullable
- external_reference string nullable
- idempotency_key string nullable
- event_type string
- posted_at timestamp
- metadata json nullable
- created_at
- updated_at

Recommended entry_side values:
- debit
- credit

### ledger_transactions

Recommended grouping table for one business event:
- id
- transaction_uuid uuid unique
- event_type string
- reference_type string
- reference_id unsigned bigint nullable
- idempotency_key string nullable
- status string
- metadata json nullable
- created_at
- updated_at

Why group entries:
- one transfer may create principal entry pair and fee entry pair
- a group record gives an audit handle for all entries belonging to one business intent

## Double-Entry Rule

Every ledger transaction must balance.

Examples:

### User Transfer With Fee

If user sends 100 and fee is 2:
- user cash account credit 102
- receiver cash account debit 100
- system fee revenue account debit 2

Equivalent rule in implementation terms:
- total debits == total credits

### Deposit Settlement

If user receives 100 after external provider settlement:
- system settlement clearing credit 100
- user cash account debit 100

### Risk Freeze

If 50 is frozen from user balance:
- user available cash credit 50
- system risk hold debit 50

This keeps the movement visible instead of silently lowering a balance number.

## Wallet Projection Rule

Wallet or balance cache should be derived from ledger accounts.

Recommended projection table options:
- keep current users.balance as transitional cache
- later introduce wallet_balances table for multi-entity and multi-currency support

Projection columns if new table is used:
- id
- account_type
- owner_id or account_code
- currency
- available_balance
- pending_balance
- reserved_balance
- last_ledger_entry_id
- updated_at

## Transitional Strategy For Current Codebase

Current code directly mutates users.balance and agent.balance.

Recommended migration sequence:

Phase 1:
- create ledger_accounts
- create ledger_transactions
- create ledger_entries
- create system accounts
- keep existing balance fields as cache

Phase 2:
- introduce WalletService to write ledger and update existing balance fields in the same DB transaction
- migrate one critical flow first, such as deposit settlement

Phase 3:
- migrate transfer, withdrawal, and virtual card funding
- prohibit direct balance mutation outside WalletService

Phase 4:
- move read paths to wallet projection logic
- reduce reliance on raw users.balance writes

## WalletService Contract

Recommended responsibilities:
- receive normalized money command
- enforce idempotency
- create ledger transaction group
- create balanced ledger entries
- update wallet projection or transitional cache
- emit domain event after commit

Recommended method examples:
- settleDeposit(...)
- createTransfer(...)
- createWithdrawal(...)
- applyFee(...)
- freezeFunds(...)
- releaseFunds(...)
- reverseTransaction(...)

## Fee Routing Rule

Every fee must have:
- fee type
- source account
- destination system account
- ledger transaction reference

Examples:
- transfer fee -> SYSTEM_FEE_REVENUE
- FX spread -> SYSTEM_FX_REVENUE
- chargeback reserve -> SYSTEM_RISK_HOLD

No fee should only exist inside TransactionCharge configuration or metadata.

## Mapping From Current Models

Current model mapping guidance:
- User -> ledger_accounts account_type user
- Agent -> ledger_accounts account_type agent
- Merchant -> ledger_accounts account_type merchant
- Transaction -> business activity history, not source of truth
- Deposit, Withdrawal, SendMoney, CashOut -> reference_type values for ledger transactions

Transaction model may continue to exist for UI and historical activity, but accounting truth must move to ledger tables.

## Acceptance Criteria

This design is acceptable only if:
- any balance shown to user can be reconstructed from ledger
- every fee lands in an explicit system account
- every ledger transaction balances exactly
- direct balance mutation in controllers is no longer required for migrated flows
- reconciliation can compare wallet projection against ledger aggregation deterministically