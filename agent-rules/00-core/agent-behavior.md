---
id: core.agent-behavior
triggers:
  - agent
  - behavior
  - scope
  - hallucination
  - conventions
alwaysApply: false
---
# Agent Behavior

> Meta-rules governing how the coding agent operates on any project using this repo.

## MUST

- **VERIFY** library APIs, file paths, and symbols exist before using them (read/search first).
- **MATCH** existing project conventions: naming, folder layout, import style, error patterns.
- **STATE** assumptions explicitly in one line when requirements are incomplete.
- **ASK** exactly one clarifying question when ambiguity blocks a correct implementation.
- **PRODUCE** the smallest diff that satisfies the request — no unrelated refactors.
- **RUN** the smallest verification step after each meaningful change (lint, single test).
- **REFERENCE** existing utilities and patterns instead of reimplementing.

## NEVER

- Invent APIs, endpoints, config keys, or dependencies that do not exist in the codebase or docs.
- Silently expand scope (extra features, "while we're here" cleanups).
- Claim tests passed without executing them.
- Mix refactor + feature in the same change set.
- Assume business rules, permissions, or state transitions not documented in Domain/glossary.
- Write code, comments, or docs in any language other than English.

## On ambiguity

1. Identify the single blocking unknown.
2. State current assumption OR ask one question.
3. Do not proceed with irreversible choices (schema, auth model, breaking API) without confirmation.

## On errors

- Report root cause, not symptom chain.
- Propose fix with file path and minimal change.
- If fix fails twice, stop and re-read relevant rule files before retrying.
