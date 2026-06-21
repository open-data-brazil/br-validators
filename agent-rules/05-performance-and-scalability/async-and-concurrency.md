---
id: perf.async
triggers:
  - async
  - concurrency
  - race
  - thread
alwaysApply: false
---
# Async and Concurrency

> No blocking I/O on hot paths; explicit race handling.

## Rules

- Blocking I/O on request thread / UI thread — offload to async worker or non-blocking API.
- Shared mutable state: use locks, atomic ops, or actor model — document choice.
- **Race conditions:** read-modify-write on shared data must be atomic or transactional.

## Retries

- Idempotent operations only — see `10-api-design/idempotency.md`.
- Bounded retries with backoff — see `06-reliability-and-observability/graceful-degradation.md`.

## Agent action

When adding background job or parallel goroutines/tasks, identify shared state and add test for concurrent access if non-trivial.
