# DeePay Webhook Trust Design

Last updated: 2026-04-15

## Goal

Protect the system from fake webhook injection, replay attacks, delayed duplicate delivery, and ambiguous provider event processing.

## Required Security Controls

Every money-affecting webhook must include or be validated through:
- signature verification
- timestamp freshness check
- event_id uniqueness
- idempotency key enforcement

These are mandatory for bank-grade handling.

## Canonical Webhook Flow

provider webhook
-> raw payload capture
-> signature verify
-> timestamp check
-> event_id uniqueness check
-> store event record
-> map to normalized event
-> WalletService or settlement orchestrator
-> lifecycle transition and ledger posting

## Event Store Requirement

Financial webhook handling must not rely only on transient controller logic.

Introduce a durable event store table for inbound financial events.

Recommended table: financial_webhook_events

Minimum columns:
- id
- provider string
- event_id string
- event_type string
- signature_valid boolean
- received_at timestamp
- event_timestamp timestamp nullable
- payload json
- payload_hash string
- processing_status string
- linked_reference_type string nullable
- linked_reference_id unsigned bigint nullable
- error_message text nullable
- created_at
- updated_at

Recommended uniqueness:
- unique on provider plus event_id

## Signature Verification Rules

### Swan

Must validate Swan signature or shared secret according to provider documentation.

### Airwallex

Must validate Airwallex signature, header format, and body hash according to provider specification.

No money event should proceed if signature verification fails.

## Timestamp Rules

Reason:
- block replay of old valid payloads

Recommended rule:
- reject webhook if signed event timestamp is outside allowed skew window

Baseline skew window:
- 5 minutes for strict handling
- adjustable only if provider behavior requires broader tolerance

## Processing Rules

If signature invalid:
- record event as rejected
- do not mutate money state

If event_id already exists and succeeded:
- return success response to provider without replaying money logic

If event exists and is processing:
- acknowledge safely without duplicate execution

If event exists with mismatched payload hash:
- raise critical alert

## Controller Rule

Webhook controllers should be thin.

They should only:
- validate provider request
- store normalized event
- call orchestrator service

They should not:
- directly mutate wallet balances
- directly write success money state without event registration

## Relationship To Idempotency Engine

Webhook trust and idempotency are related but not identical.

Webhook trust answers:
- did this provider really send this event?

Idempotency answers:
- has this money intent already been applied?

Both are required.

## Acceptance Criteria

Webhook trust is acceptable only if:
- fake webhook cannot create money movement
- replayed valid webhook cannot double-credit or double-debit
- every inbound financial event is durably stored
- provider event uniqueness is enforced
- WalletService receives only verified or explicitly quarantined events