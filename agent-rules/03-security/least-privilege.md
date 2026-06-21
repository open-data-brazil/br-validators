---
id: sec.least-privilege
triggers:
  - least-privilege
  - iam
  - scope
  - role
alwaysApply: false
---
# Least Privilege

> Every identity scoped to minimum permissions required.

## Scope

| Identity | Rule |
|----------|------|
| DB users | Read-only vs read-write per service; no shared admin DB user |
| Service accounts | One account per service; no platform-wide god key |
| API keys | Scoped to tenant/resource/actions needed |
| Cloud IAM | Policy per workload; no `*` actions in production |
| Human admin | Break-glass accounts audited; MFA required |

## Runtime

- Application DB connection uses limited role — not schema owner.
- Migrations use separate elevated credential in CI only.

## Agent action

When adding DB query or cloud API call, use existing scoped credential — never widen to "make it work" with admin access.
