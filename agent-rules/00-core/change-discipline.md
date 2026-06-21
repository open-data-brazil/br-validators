---
id: core.change-discipline
triggers:
  - commit
  - pr
  - refactor
  - diff
  - change
alwaysApply: false
---
# Change Discipline

> How to structure edits, commits, and PRs for reviewability and safe rollback.

## One logical change per unit of work

Each commit or PR MUST contain exactly one of:

- Feature implementation
- Bug fix
- Refactor (no behavior change)
- Test-only change
- Documentation-only change

**NEVER** mix refactor + feature in the same diff.

## Edit order (recommended)

1. Tests or contract (if TDD / API change)
2. Domain layer
3. Application layer
4. Infrastructure adapters
5. Interface layer (HTTP, CLI, UI)
6. Documentation / glossary updates if domain terms changed

## Diff hygiene

- Remove dead code and commented-out blocks in files you touch.
- Do not reformat unrelated files.
- Do not rename symbols outside the change scope unless required for the task.

## Before marking complete

- [ ] Change matches request scope
- [ ] Relevant tests run and pass
- [ ] Glossary updated if new domain term introduced
- [ ] No secrets, PII, or debug-only config committed
- [ ] English only in all new strings and comments
