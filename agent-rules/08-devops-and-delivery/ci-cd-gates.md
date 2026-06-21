---
id: devops.ci
triggers:
  - ci
  - cd
  - pipeline
  - merge
alwaysApply: false
---
# CI/CD Gates

> Lint + test + security scan required before merge.

## Required gates (main branch)

- [ ] Linter / formatter
- [ ] Unit + integration tests
- [ ] Dependency vulnerability scan
- [ ] Secret scanning (no keys in diff)
- [ ] Coverage gate on changed Domain files (if configured)

## Branch policy

- **No direct push to main** — PR only.
- PR requires passing CI + review (per team policy).

## Agent action

Run local lint/test before marking task complete. Fix CI failures in same branch — do not disable gates without ADR.
