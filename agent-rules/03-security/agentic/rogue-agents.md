---
id: sec.agentic.asi10
triggers:
  - agentic
  - rogue
  - monitoring
  - kill-switch
  - asi10
alwaysApply: false
---
# Rogue Agents (ASI10)

> OWASP Agentic 2026 — compromised or drifted agents act outside scope persistently.

## Agent one-liners

- Monitor agent action baseline; alert on anomalous tool frequency or scope drift.
- Rotate agent credentials; revoke on task completion.
- Immutable agent audit log — who triggered, tools used, files touched.
- Canary tasks to detect agents ignoring policy.

## MUST

- Kill switch: disable agent API keys and MCP sessions immediately.
- Periodic re-validation agent still follows pinned rule harness version.
- Separate prod agent identities from dev — no shared keys.

## MUST NOT

- Leave autonomous agents running unattended on prod without monitoring.
- Ignore repeated policy violations as "model quirks".

## Detection signals

- Access to paths outside project scope
- Tool calls without corresponding user task
- Writes after user session ended
- Elevated privilege attempts

## Agent action

Long-running agent service → document monitoring, revocation, and incident runbook in ADR.
