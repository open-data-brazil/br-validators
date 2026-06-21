---
id: sec.secrets
triggers:
  - secret
  - credential
  - env
  - api-key
  - password
alwaysApply: false
---
# Secrets and Credentials

> No hardcoded secrets; never log secrets or PII.

## Storage

- Secrets in secret manager or environment variables — NEVER in source, git, or client bundles.
- `.env` files gitignored; provide `.env.example` with placeholder keys only.
- Rotate credentials on compromise; support key rotation without downtime where possible.

## Logging

- NEVER log passwords, tokens, API keys, full credit card numbers, government IDs — even at debug level.
- Mask sensitive fields in structured logs (see `07-data-management/pii-and-data-retention.md`).

## Code review triggers

- String literals resembling keys (`sk-`, `AKIA`, `Bearer eyJ`)
- Config committed with real URLs containing embedded credentials

## Agent action

When adding integration, read credentials from env/config port — add example env var name to docs, not value.
