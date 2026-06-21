---
id: arch.scale
triggers:
  - scale
  - idempotency
  - horizontal
  - stateless
alwaysApply: false
---
# Scalability Patterns

> Design for horizontal scale and safe retries from day one.

## Defaults

- **Stateless services** — session/state in external store, not in-process memory.
- **Horizontal scaling** preferred over vertical — no single-node assumptions for hot paths.
- **Idempotency keys** on all mutating operations that may be retried (payments, creates, webhooks).

## Patterns

| Concern | Pattern |
|---------|---------|
| Retry storms | Exponential backoff + jitter; max attempts cap |
| Duplicate requests | Idempotency key store with TTL |
| Read scaling | Cache with explicit invalidation (see `05-performance-and-scalability/caching-strategy.md`) |
| Write scaling | Partition by tenant/aggregate where needed; avoid hot rows |

## Agent action

When adding POST/PUT that creates billable or irreversible state, add idempotency key support or document why safe without it.
