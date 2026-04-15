# DeePay Withdrawal Protection And Risk Design

Last updated: 2026-04-15

## Goal

Protect the highest-risk money path in the system: outbound withdrawal or payout.

Direct wallet to bank movement is not acceptable for real-money production.

## Required Withdrawal Protection Chain

Canonical flow:

1. freeze funds
2. create withdrawal intent
3. send to Swan or Airwallex
4. wait confirmation
5. finalize ledger

This sequence is mandatory.

## Why This Is Required

Reasons:
- provider may reject after request creation
- provider may accept but settle later
- user balance must not remain fully spendable during payout attempt
- reconciliation needs an intent and outcome boundary

## Recommended Internal Objects

### Withdrawal Intent

Represents user request and business validation outcome.

Recommended fields:
- intent_uuid
- user_id
- currency
- amount
- fee_amount
- frozen_amount
- lifecycle_state
- provider nullable
- provider_reference nullable
- risk_score nullable
- review_status nullable
- created_at
- updated_at

### Funds Freeze

Freeze should be reflected in internal ledger or wallet projection.

Recommended semantics:
- available balance decreases
- frozen or reserved balance increases

### Finalization

Only after provider confirmation should the payout become fully settled.

If provider fails:
- release frozen funds
- mark intent failed
- write compensating ledger movement if necessary

## AML-Lite Requirements

Minimum AML-lite or risk scoring layer should produce:
- risk_score from 0 to 100

Baseline rules already agreed in concept:
- large amount on new user -> freeze or review
- high-frequency transfers -> review
- circular multi-account behavior -> block or manual review

Recommended future tables:
- risk_decisions
- risk_flags
- screened_counterparties

Recommended risk decision outputs:
- allow
- allow_with_monitoring
- freeze
- manual_review
- block

## Risk Engine Placement

Recommended runtime placement:

User
-> API Gateway
-> Auth plus Risk Engine
-> WalletService
-> Ledger
-> State Machine
-> External Providers
-> Reconciliation Engine

Risk must execute before irreversible money movement.

## Event Store Relationship

High-risk flows such as withdrawal should leave non-lossy event history.

Recommended event examples:
- withdrawal.intent.created
- withdrawal.funds.frozen
- withdrawal.sent_to_provider
- withdrawal.provider_confirmed
- withdrawal.failed
- withdrawal.released

## Current Gap In Repository

Current repository has withdrawal models and status fields, but lacks a documented protected flow that separates:
- fund freeze
- external provider submission
- final settlement
- compensating release

That means current withdrawal semantics are not yet real-money production grade.

## Acceptance Criteria

Withdrawal protection is acceptable only if:
- user cannot double-spend funds during payout processing
- provider failure can release or reverse funds cleanly
- every withdrawal has intent, provider reference, and final state
- high-risk payouts can be frozen or reviewed before provider submission
- risk decision and payout lifecycle are auditable