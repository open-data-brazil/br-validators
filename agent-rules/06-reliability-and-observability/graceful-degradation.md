---
id: rel.degrade
triggers:
  - circuit-breaker
  - retry
  - fallback
  - timeout
alwaysApply: false
---
# Graceful Degradation

> Explicit fallback when dependencies fail.

## Required patterns

| Pattern | Use when |
|---------|----------|
| **Timeout** | Every external call — no unbounded wait |
| **Retry + backoff** | Transient failures; idempotent ops only |
| **Circuit breaker** | Repeated failures to dependency |
| **Fallback** | Non-critical feature can degrade (e.g. recommendations → empty) |

## Rules

- Degraded mode behavior **documented** — users/API clients know what to expect.
- **NEVER fail open** on auth/security checks when dependency down — fail closed (503/ deny).
- Partial success responses when batch — per `error-handling.md`.

## Agent action

When calling external API, wrap with timeout + structured error mapping in same change — not bare client call.
