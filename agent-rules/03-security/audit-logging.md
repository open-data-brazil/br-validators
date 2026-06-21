---
id: sec.audit
triggers:
  - audit
  - security-log
  - compliance
  - alerting
  - owasp
alwaysApply: false
---
# Audit Logging and Alerting

> OWASP A09:2025 — Security Logging **and Alerting** Failures. Log + alert — not log alone.

## Agent one-liners

- Every security audit event MUST have a defined alert path for critical severity.
- Logging without alerting is insufficient for incident detection (OWASP 2025/2026).
- Alert on: repeated auth failure, privilege escalation, bulk export, agent policy violation.

## MUST audit

- Login success/failure, logout, MFA events
- Permission/role changes
- Data export, bulk delete, admin overrides
- Tenant configuration changes
- Access denied to sensitive resources (sampled if high volume)

## Log fields

```text
timestamp, correlationId, actorId, tenantId, action, resourceType, resourceId, outcome, clientIp
```

## MUST NOT log

- Passwords, tokens, session secrets
- Full PII payloads (SSN, card numbers) — log ID references only
- Request bodies containing secrets even on error

## Retention

- Define retention per regulation (LGPD/GDPR) — see `07-data-management/pii-and-data-retention.md`.
- Immutable append-only store where compliance requires.

## Agent action

When adding admin or auth feature, add audit event emission in same PR — not follow-up.
