# DeePay Payment State Machine Design

Last updated: 2026-04-15

## Goal

Replace overly simple credit or debit semantics with a lifecycle model suitable for real bank and payment-provider flows.

Real-money operations are not always instant. Deposits, payouts, and settlement updates may take seconds, minutes, or days.

## Canonical Lifecycle

Baseline lifecycle agreed for real-money transaction orchestration:

PENDING -> PROCESSING -> POSTED -> SETTLED -> FAILED

Interpretation:
- PENDING: intent created, not yet being executed
- PROCESSING: handed to internal executor or external provider
- POSTED: internal ledger written and product-visible state created
- SETTLED: external provider truth confirms finality
- FAILED: terminal failure after intent or processing

Additional optional states for future use:
- REVERSED
- CANCELED
- EXPIRED
- MANUAL_REVIEW

## Why This Is Required

Reasons the current repository needs a state machine layer:
- webhook arrival may be delayed
- payout may fail after initial request
- bank inbound payments can remain pending for hours
- external provider can acknowledge receipt before final settlement
- reconciliation needs explicit lifecycle semantics instead of binary success flags

## Scope

The state machine should apply to:
- deposits
- withdrawals
- internal transfers where business review may exist
- card top-ups
- payouts to Swan or Airwallex
- refunds and reversals

## State Semantics By Flow

### Deposit

Recommended path:
- PENDING: deposit intent created
- PROCESSING: payment provider accepted request or inbound webhook arrived for initial handling
- POSTED: internal ledger credited and wallet projection updated
- SETTLED: provider truth or settlement file confirms finality
- FAILED: provider failure or verification rejection

### Withdrawal

Recommended path:
- PENDING: withdrawal intent created
- PROCESSING: funds frozen and request sent to external provider
- POSTED: internal withdrawal ledger posted in protected state
- SETTLED: provider confirms payout success
- FAILED: provider rejects or transfer times out terminally

### Internal Transfer

Recommended path for simplest case:
- PENDING: command accepted
- POSTED: atomic internal ledger applied
- SETTLED: same as posted for internal-only movement
- FAILED: validation or risk failure

## Data Design

Recommended fields on financial instruction or transaction aggregate:
- lifecycle_state
- lifecycle_version
- state_reason_code nullable
- external_state nullable
- external_state_at nullable
- posted_at nullable
- settled_at nullable
- failed_at nullable

If existing models are retained during migration, these fields can begin on a new aggregate table rather than backfilling every existing business table immediately.

## Transition Rules

### Allowed transitions

- PENDING -> PROCESSING
- PENDING -> FAILED
- PROCESSING -> POSTED
- PROCESSING -> FAILED
- POSTED -> SETTLED
- POSTED -> FAILED only if compensation or reversal rule exists
- SETTLED -> REVERSED only by explicit compensating flow

### Forbidden transitions

- FAILED -> SETTLED without a new compensating flow
- SETTLED -> PENDING
- POSTED -> PENDING

## Event Mapping

Every lifecycle change should emit a financial event.

Examples:
- deposit.pending.created
- deposit.processing.started
- deposit.posted
- deposit.settled
- withdrawal.failed

These events should later feed audit, notifications, reconciliation, and risk review.

## Integration With WalletService

WalletService should not be a blind credit or debit helper.

It should orchestrate:
- lifecycle transition validation
- ledger posting
- wallet projection update
- event emission
- idempotency enforcement

This is why WalletService is better described as a financial transaction orchestrator.

## Current Gap In Repository

Current repository mostly uses status constants like initiated, pending, success, reject.

That is not enough for:
- external provider lifecycle separation
- posted versus settled distinction
- clean payout protection
- reconciliation by stage

## Acceptance Criteria

This state machine layer is acceptable only if:
- every money flow has an explicit lifecycle state
- posted and settled are distinct when external settlement exists
- failed states preserve audit reason
- invalid transitions are blocked by code
- reconciliation can report stuck transactions by lifecycle stage