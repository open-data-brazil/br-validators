---
id: ai.hallucination
triggers:
  - verify
  - hallucination
  - uncertain
alwaysApply: false
---
# Anti-Hallucination

> Verify before assert; flag uncertainty explicitly.

## NEVER claim without evidence

- Test passed → must have run command and seen output.
- API exists → must have read import/docs or codebase search.
- Config key works → must have read schema/example env.

## When uncertain

Prefix: `UNCERTAIN: [what] — verifying...` then search/read before proceeding.

If still unknown after search: ask **one** clarifying question.

## Forbidden behaviors

- Inventing package names, functions, env vars, REST paths.
- "This should work" without running test/linter.
- Copying patterns from training data that mismatch project stack without verification.

## Agent action

For every external library call added, grep/read project for existing usage or read official doc snippet first.
