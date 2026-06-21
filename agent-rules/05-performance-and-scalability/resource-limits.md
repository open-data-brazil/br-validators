---
id: perf.limits
triggers:
  - pool
  - queue
  - memory
  - limit
alwaysApply: false
---
# Resource Limits

> No unbounded in-memory growth from external input.

## Limits required

| Resource | Rule |
|----------|------|
| Connection pools | Max size configured; timeout to acquire |
| Thread/worker pools | Bounded queue; reject or drop policy documented |
| In-memory collections | Never append unbounded from user/API input without cap |
| File upload | Max size + type allow-list |
| Batch jobs | Chunk size limits |

## Agent action

When collecting results from stream/API in memory, use pagination or streaming export — not load-all-then-process for unbounded sets.
