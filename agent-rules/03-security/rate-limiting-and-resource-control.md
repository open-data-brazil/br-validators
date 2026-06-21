---
id: sec.rate-limit
triggers:
  - rate-limit
  - throttle
  - timeout
  - pagination
alwaysApply: false
---
# Rate Limiting and Resource Control

> OWASP API — unrestricted resource consumption is a recognized risk category.

## Every public endpoint MUST have

| Control | Guidance |
|---------|------------|
| Rate limit | Per user + per IP; stricter on auth endpoints |
| Request size limit | Body max bytes; reject oversized before parsing |
| Timeout | Connect + read + total; no unbounded waits |
| Pagination | Lists default paginated; max page size capped |

## Auth endpoints

- Stricter rate limits on login, password reset, MFA — prevent brute force and enumeration.
- Account lockout or progressive delay policies where appropriate.

## Expensive operations

- Export, report generation, bulk upload — separate quotas or async job queue.

## Agent action

When adding public POST/GET list endpoint, add rate limit middleware config and pagination defaults in same change.
