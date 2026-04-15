# DeePay External Ledger And Settlement Design

Last updated: 2026-04-15

## Goal

Introduce a second financial truth layer for real external money movement.

The platform must distinguish between:
- internal ledger truth for application accounts
- external provider truth for bank and payment network movement

## Two-Ledger Model

### Internal Ledger

Covers:
- user balances
- internal transfers
- risk holds
- fee routing
- wallet projection

### External Ledger

Covers:
- Swan real bank events
- Airwallex real funding and payout events
- provider statement lines
- provider settlement status and transfers

## Why This Is Required

Without external truth tracking:
- internal balances can drift from real provider state
- settled and posted cannot be separated correctly
- reconciliation is incomplete
- operator cannot explain why provider and product views differ

## Recommended Tables

### external_ledger_accounts

Minimum columns:
- id
- provider string
- external_account_id string
- currency string
- account_type string
- status string
- metadata json nullable
- created_at
- updated_at

### external_ledger_entries

Minimum columns:
- id
- external_ledger_account_id unsigned bigint
- provider string
- event_id string nullable
- external_reference string
- entry_type string
- amount decimal(24, 8)
- currency string
- external_state string
- occurred_at timestamp
- payload json nullable
- created_at
- updated_at

Recommended uniqueness:
- unique on provider plus external_reference plus entry_type where appropriate

## State Relationship

Internal and external truth should be mapped but not conflated.

Examples:
- internal POSTED may exist before external SETTLED
- external FAILED may force internal FAILED or compensating reversal
- external provider may emit intermediate states not visible to end user

## Settlement Mapping

Recommended flow for provider-backed deposit:
- external event arrives
- verified event stored
- external ledger entry recorded
- internal lifecycle moves to POSTED when product funds are credited
- internal lifecycle moves to SETTLED when provider finality is confirmed

Recommended flow for provider-backed withdrawal:
- withdrawal intent created internally
- funds frozen internally
- request sent externally
- external ledger entry created for provider request
- final webhook or provider poll confirms settlement or failure

## Reconciliation Relationship

External ledger is one of the three reconciliation sources:
- internal ledger
- external provider truth
- wallet cache

Mismatch examples:
- provider settled, internal not posted
- internal posted, provider failed
- wallet cache differs from internal ledger after provider success

## Current Gap In Repository

Current repository has many gateway callback endpoints but no explicit external ledger layer.

This means provider truth is effectively mixed into business records without a dedicated settlement truth model.

## Acceptance Criteria

External ledger layer is acceptable only if:
- provider money movement has durable internal representation
- internal and external lifecycle can differ without confusion
- reconciliation can compare provider truth against internal truth
- Swan and Airwallex integrations do not rely only on wallet cache or generic transaction rows