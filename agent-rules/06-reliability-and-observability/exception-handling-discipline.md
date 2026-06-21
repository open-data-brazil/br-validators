---
id: rel.exception
triggers:
  - exceptional
  - partial-failure
  - fail-open
  - None
alwaysApply: false
---
# Exception Handling Discipline

> OWASP 2025 — Mishandling of Exceptional Conditions: null, timeout, partial failure, fail-open.

## Map to code review

For every new code path, verify handling of:

| Condition | Wrong | Right |
|-----------|-------|-------|
| Null/missing | Assume default | Guard, optional type, or explicit error |
| Empty collection | Index `[0]` | Early return or empty result semantics |
| Timeout | Hang forever | Timeout + retry/fail policy |
| Partial batch failure | All succeed message | Per-item errors in response |
| Auth service down | Allow access | Deny / 503 fail-closed |
| Invalid enum/state | Undefined behavior | Domain exception or 400 |

## Logical errors

- Off-by-one, wrong operator, inverted boolean — caught by tests, not production logs only.
- Assert invariants in domain — fail loud in dev, structured error in prod.

## Agent action

Copy checklist into PR self-review for Application/Infrastructure changes. Add test for each exceptional row where applicable.
