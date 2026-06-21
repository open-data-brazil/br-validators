---
id: sec.agentic.asi03
triggers:
  - agentic
  - agent-identity
  - asi03
alwaysApply: false
---
# Identity and Privilege Abuse (ASI03)

> OWASP Agentic 2026 — agent uses excessive or stale credentials.

## Agent one-liners

- Agent identity separate from human user — scoped service account per agent/workflow.
- Short-lived tokens; refresh rotation; no long-lived god keys in agent env.
- Agent MUST NOT inherit human admin session for convenience.
- Revoke agent credentials when task completes.

## MUST

- Map agent actions to actor ID in audit log (human who triggered + agent identity).
- Scope API keys to minimum endpoints needed for task.
- Re-auth or escalate approval for privilege elevation mid-task.

## MUST NOT

- Store user password or refresh token in agent memory for reuse.
- Share one API key across all agents and environments.

## Maps to

- `../authorization.md`, `../least-privilege.md`, `../authentication.md`

## Agent action

When adding agent integration, create dedicated scoped credential — never reuse developer admin key.
