---
id: data.compat
triggers:
  - backward-compatible
  - versioning
  - deprecate
alwaysApply: false
---
# Backward Compatibility

> Prefer additive schema and API changes; version breaking changes.

## Database

- **Additive first:** new nullable column, new table — avoid rename/drop in single deploy.
- Expand-contract pattern for renames: add new → dual-write → migrate → remove old.

## API

- Breaking change → new API version (`/v2/`).
- Deprecation period documented before removal.

## Events

- Version event schema; consumers ignore unknown fields.
- Up-version on breaking payload change.

## Agent action

If rename requested, propose expand-contract steps — do not breaking rename column and code in one deploy without flag day plan.
