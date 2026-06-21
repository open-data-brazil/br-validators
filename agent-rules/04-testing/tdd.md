---
id: test.tdd
triggers:
  - tdd
  - test-first
  - given-when-then
alwaysApply: false
---
# TDD

> Tests alongside or before implementation; GIVEN/WHEN/THEN format.

## Workflow

1. Write failing test expressing business rule or behavior.
2. Implement minimum code to pass.
3. Refactor with tests green.

## Test naming

```text
given_[context]_when_[action]_then_[outcome]
```

Example: `given_draftOrder_when_submit_then_statusIsSubmittedAndEventRaised`

## Domain first

- Business rules and state machines get unit tests **before** Application/Infrastructure wiring.
- One assertion focus per test — fail for one reason.

## Agent rules

- NEVER skip tests for domain logic "to save time".
- NEVER change test expectations to match wrong implementation without user approval.
- Run tests before claiming completion.
