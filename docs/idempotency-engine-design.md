# DeePay Idempotency Engine Design

Last updated: 2026-04-15

## Goal

Prevent duplicate money movement caused by:
- webhook retries
- client retries
- API replay attacks
- timeout-driven resubmission
- concurrent duplicate requests

The idempotency engine must guarantee that the same money intent is applied once, and repeated submissions return the original result.

## Scope

Must apply to all money-affecting commands:
- deposit confirmation webhook
- payout webhook
- transfer API
- withdrawal API
- top-up API
- refund API
- reversal API
- settlement callback
- any admin adjustment endpoint that changes funds

Must not be limited to HTTP only. The same pattern should be usable for event consumers and queue workers.

## Core Rule

No ledger write is allowed unless it is wrapped by an idempotent command boundary.

That means the flow becomes:

request or event
-> normalize command payload
-> resolve idempotency key
-> lock or reserve key
-> run WalletService transaction once
-> store result envelope
-> return stored result for repeats

## Key Design

### Required Key Inputs

Each money command must have:
- idempotency_key
- operation_type
- actor_type
- actor_id
- request_hash

### Key Sources

Use these rules:
- client-originated API: require Idempotency-Key header or body field
- webhook: derive from provider event id or provider transaction id
- internal commands: generate from command UUID and persist before execution

### Key Format

Recommended format:

provider_or_channel:operation:stable_reference

Examples:
- airwallex:webhook:evt_123456
- swan:webhook:transfer_98765
- api:withdrawal:1f3270c9-3cbf-4a0f-8b89-5f8d58f0c302
- api:transfer:client_20260415_00012

## Storage Model

Recommended table: idempotency_keys

Minimum columns:
- id
- idempotency_key string unique
- operation_type string
- actor_type string nullable
- actor_id unsigned bigint nullable
- request_hash string
- status string
- resource_type string nullable
- resource_id unsigned bigint nullable
- response_code integer nullable
- response_body json nullable
- first_seen_at timestamp
- last_seen_at timestamp
- expires_at timestamp nullable
- created_at timestamp
- updated_at timestamp

Recommended statuses:
- processing
- succeeded
- failed_retryable
- failed_terminal

## Execution Contract

### API Request Contract

If request is money-related and missing idempotency_key:
- reject with validation error
- do not attempt partial execution

If request_hash differs for same idempotency_key:
- reject as key misuse
- return 409 conflict

If key exists and succeeded:
- return original response_code and response_body

If key exists and processing:
- return 409 or 202 depending on endpoint semantics

If key exists and failed_terminal:
- return original failure payload

If key exists and failed_retryable:
- allow retry only under explicit service rule

## Concurrency Strategy

### Database-Level Rule

Use a unique index on idempotency_key.

### Service-Level Rule

Within a DB transaction:
- insert the key with status processing
- if insert fails due to uniqueness, fetch the existing row and return stored state
- only after successful ledger commit, mark the key succeeded and save result envelope

### Why This Matters

This prevents two PHP workers from executing the same webhook or transfer at the same time.

## Laravel Service Shape

Recommended service names:
- App\Services\Finance\Idempotency\IdempotencyService
- App\Services\Finance\Idempotency\IdempotentCommandRunner

Recommended methods:
- reserve(string $key, string $operationType, array $context): IdempotencyReservation
- complete(IdempotencyReservation $reservation, array $result, int $statusCode): void
- fail(IdempotencyReservation $reservation, array $result, int $statusCode, bool $retryable): void
- replay(string $key): IdempotencyReplayResult

## Request Hash Rule

Same key with different request payload must be treated as misuse.

Recommended request_hash inputs:
- canonical JSON of money-affecting fields only
- sorted keys
- exclude timestamps and trace metadata unless they alter money intent

Examples of fields to include:
- amount
- currency
- source account
- destination account
- provider reference
- transfer direction

## Webhook Rules

### Airwallex

Use provider event id as first choice.
Fallback to provider payment or transfer id only if event id is absent.

### Swan

Use Swan transfer or webhook event reference.
If Swan sends versioned status updates, include event id and event type to avoid collapsing different lifecycle events incorrectly.

### Existing Deposit Flow Migration

Current flow uses status checks and partial replay protection.
Migration target:
- gateway callback enters idempotency service first
- only then call WalletService or deposit settlement service

## Failure Semantics

Three separate outcomes matter:
- ledger not written
- ledger written and response saved
- ledger written but response save interrupted

Engineering rule:
- the idempotency record and ledger write must be in the same transaction boundary where practical
- if response envelope cannot be saved after ledger commit, the system must still be able to reconstruct a success replay from reference ids

## Migration Plan

Phase 1:
- add idempotency_keys table
- add request validation support
- wrap one critical webhook and one critical API endpoint

Phase 2:
- move all deposit and payout entry points behind the engine
- reject money requests without key

Phase 3:
- extend to async settlement and internal adjustment jobs

## Acceptance Criteria

The engine is acceptable only if these are true:
- duplicate webhook cannot write funds twice
- same API retry returns same business result
- same key with changed payload is rejected
- two concurrent workers cannot double-apply the same money event
- every successful money command can be replayed by key lookup