---
id: test.regression
triggers:
  - bugfix
  - regression
  - fix
alwaysApply: false
---
# Regression Safety

> Every bug fix ships with a test that would have caught it.

## Rule

Bug fix PR MUST include:

1. Failing test reproducing bug (or documented why impossible — rare).
2. Fix.
3. Test passing.

## Test placement

- Domain bug → domain unit test
- Authorization bug → application/integration test with wrong actor
- Serialization bug → contract test on DTO mapping

## Agent action

When fixing reported bug, write test first named after issue ID if available: `regression_issue42_givenX_whenY_thenZ`.

Never close bug fix without test unless user explicitly waives for hotfix — then create follow-up ticket for test.
