---
id: clean.errors
triggers:
  - error
  - exception
  - try
  - catch
  - edge-case
alwaysApply: false
---
# Error Handling

> Aligns with OWASP 2025 **Mishandling of Exceptional Conditions** — edge states must be explicit, not assumed away.

## Rules

- **NEVER** swallow exceptions silently (empty catch blocks).
- **NEVER** fail open on security-relevant checks (auth, tenant isolation, permission).
- Use **typed/custom exceptions** in Domain and Application — not generic `Error` everywhere.
- **Fail fast and loud** in development; **fail safe** in production (structured error, no stack trace to client).

## Exceptional conditions (MUST handle explicitly)

| Condition | Required handling |
|-----------|-------------------|
| Null / empty optional | Guard or explicit empty state — never assume present |
| Timeout | Bounded waits; return retryable error or fallback per `graceful-degradation.md` |
| Partial failure (batch) | Report per-item outcomes; do not report full success if any item failed |
| Invalid state transition | Domain exception with clear code — never silent no-op |
| Dependency unavailable | Circuit breaker / degraded mode — document behavior |

## Layer responsibilities

- **Domain:** throw domain exceptions for rule violations.
- **Application:** catch infrastructure errors, map to application errors, never leak DB/driver details.
- **Interface:** map to HTTP status + structured error body (see `10-api-design/`).

## Logging errors

- Log exception type, message, correlation ID — not full sensitive payloads.
- Security failures: audit log (see `03-security/audit-logging.md`).

## Agent action

For every new code path, enumerate: what if input is null? timeout? duplicate? unauthorized? Handle or document why impossible.
