---
id: rel.log
triggers:
  - logging
  - structured-log
  - correlation
alwaysApply: false
---
# Logging Standards

> Structured logs with correlation across services.

## Format

- **Structured JSON** in production (key-value fields).
- Consistent levels: `ERROR` (action needed), `WARN` (degraded), `INFO` (business milestones), `DEBUG` (dev only).

## Required fields

```text
timestamp, level, message, correlationId, traceId, service, tenantId?, userId?
```

## Propagation

- Generate or accept `correlationId` at entry (HTTP header `X-Correlation-ID`).
- Pass to all downstream calls and log lines.

## Rules

- Log **what happened** with IDs — not full payloads (see security audit rules).
- English only in log message templates.

## Agent action

When adding new service call chain, thread correlation ID through — do not log isolated orphan lines.
