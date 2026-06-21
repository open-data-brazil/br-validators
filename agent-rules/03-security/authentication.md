---
id: sec.authn
triggers:
  - auth
  - authentication
  - login
  - mfa
  - oauth
  - oidc
  - jwt
alwaysApply: false
---
# Authentication

> Strong standard protocols; no custom crypto.

## Requirements

- Use **OAuth2/OIDC** or platform-standard auth — never roll custom password/crypto schemes.
- **MFA** for elevated-privilege roles (admin, billing, data export).
- **Short-lived access tokens** + refresh token rotation where applicable.
- Session TTL **per role** — admin sessions expire faster than read-only users.
- Store password hashes with vetted algorithms (bcrypt, argon2) — never plaintext, never MD5/SHA1 alone.

## Agent rules

- NEVER implement custom JWT parsing crypto — use vetted middleware/libraries.
- Authenticate on every protected route — no "optional auth" that silently grants anonymous access to private data.
- Log authentication failures for audit — without logging passwords.

## Multi-tenant

- Tenant identity derived from token/session — verified on every request (see `authorization.md`).
