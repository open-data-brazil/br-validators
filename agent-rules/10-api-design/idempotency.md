---
id: api.idempotency
triggers:
  - idempotency
  - idempotency-key
  - retry
alwaysApply: false
---
# Idempotency

> Mutating retriable operations must be safe to replay.

## When required

- POST creating billable/stateful resources
- Payment/charge endpoints
- Webhook handlers
- Message queue consumers

## Pattern

```text
Client sends: Idempotency-Key: <uuid>
Server: store key + result TTL (24–72h)
Replay same key → return same response, no duplicate side effect
```

## Implementation

- Unique constraint on `(tenantId, idempotencyKey)` or equivalent.
- Store response snapshot or resource ID for replay.
- Domain operation still enforces business invariants on first execution.

## Agent action

When adding POST that creates money/order/subscription, add idempotency key handling in Application layer — not optional follow-up.
