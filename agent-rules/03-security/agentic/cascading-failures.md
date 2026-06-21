---
id: sec.agentic.asi08
triggers:
  - agentic
  - cascade
  - circuit-breaker
  - asi08
alwaysApply: false
---
# Cascading Failures (ASI08)

> OWASP Agentic 2026 — one agent failure corrupts entire workflow.

## Agent one-liners

- Circuit breakers on agent tool calls and sub-agent delegation.
- Bulk operations: per-item failure isolation — not all-or-nothing silent fail.
- Limit retry storms — max attempts + backoff on agent loops.
- Kill switch to halt all agents for tenant/workspace.

## MUST

- Idempotent side effects where agents retry (see `../../10-api-design/idempotency.md`).
- Health checks on orchestrator; degrade gracefully.
- Compensating transactions or rollback for partial multi-step agent flows.

## MUST NOT

- Unbounded agent loop without step cap or token budget.
- Propagate exception as success to downstream agents.

## Maps to

- `../../06-reliability-and-observability/graceful-degradation.md`, `../../06-reliability-and-observability/exception-handling-discipline.md`

## Agent action

Agent orchestration code must define max steps, timeout, and partial failure response in same change.
