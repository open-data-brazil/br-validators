---
id: devops.env
triggers:
  - environment
  - config
  - twelve-factor
alwaysApply: false
---
# Environment Parity

> Config via environment variables — never environment-specific code branches.

## Rules

- `if (prod)` / `if (process.env.NODE_ENV)` for **behavior** differences — forbidden except feature flags.
- Connection strings, feature toggles, log levels → **env vars** or config service.
- Same artifact/container promoted dev → staging → prod; only config changes.

## Twelve-factor alignment

- Dev/prod parity for services and dependencies (version pinned).
- Secrets injected at runtime — not baked in image.

## Agent action

When adding config, add to `.env.example` with description — never hardcode prod URL in source.
