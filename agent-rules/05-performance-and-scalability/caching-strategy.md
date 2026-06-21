---
id: perf.cache
triggers:
  - cache
  - invalidation
  - redis
alwaysApply: false
---
# Caching Strategy

> No cache without documented invalidation path.

## Before adding cache

Document in code or ADR:

```text
KEY:     [pattern]
TTL:     [duration]
INVALIDATE WHEN: [events or writes that bust cache]
STALE OK: [yes/no — if yes, max staleness]
```

## Rules

- Cache at appropriate layer — not duplicated uncoordinated layers.
- Never cache per-user authorized data under shared key without tenant/user in key.
- Prefer explicit invalidation over hope-TTL-works for correctness-critical data.

## Agent action

If adding `cache.get/set`, add invalidation in same change for every write path touching that entity.
