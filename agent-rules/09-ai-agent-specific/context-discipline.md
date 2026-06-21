---
id: ai.context
triggers:
  - context
  - discipline
  - load-rules
alwaysApply: false
---

# Context Discipline

> Load minimal rule set for the current task.

## Always loaded (via manifest + Cursor)

- `rules/AGENT-CORE-PRINCIPLES.md`
- `rules/09-ai-agent-specific/token-economy.md`
- `rules/09-ai-agent-specific/anti-hallucination.md`
- `.cursor/rules/*.mdc`

## Conditional load

```bash
./harness/resolve-rules.sh <task keywords>
```

| Task | Keywords |
|------|----------|
| New feature | `agent layer domain` |
| Domain logic | `domain state event layer` |
| API work | `api endpoint auth validation contract` |
| Security | `security authz bola injection` |
| Bug fix | `bugfix regression error` |
| Performance | `query cache n+1` |
| Refactor | `refactor complexity change` |

## MUST NOT

- Load entire `rules/` tree for a one-line fix.
- Skip security rules on "small" endpoints.

## Agent action

State which rule file IDs you loaded at start of non-trivial tasks.
