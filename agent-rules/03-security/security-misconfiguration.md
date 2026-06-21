---
id: sec.misconfig
triggers:
  - misconfiguration
  - headers
  - cors
  - debug
  - production
alwaysApply: false
---
# Security Misconfiguration

> OWASP 2025 #2 — misconfiguration found in virtually every tested application.

## Production MUST NOT have

- Default credentials (admin/admin, root/password)
- Debug mode / verbose stack traces exposed to clients
- Directory listing, open admin panels, unauthenticated health with sensitive data
- CORS `*` with credentials
- Missing security headers on web responses

## Required security headers (web)

| Header | Purpose |
|--------|---------|
| `Strict-Transport-Security` | Force HTTPS |
| `Content-Security-Policy` | XSS mitigation |
| `X-Frame-Options` or CSP `frame-ancestors` | Clickjacking |
| `X-Content-Type-Options: nosniff` | MIME sniffing |
| `Referrer-Policy` | Leakage control |

## Error responses

- Client: structured error code + safe message.
- Server logs: full detail with correlation ID.
- NEVER return SQL, stack traces, or internal paths to clients in production.

## Agent action

When adding new service or route, verify prod config template disables debug and sets headers. Add to deployment checklist if missing.
