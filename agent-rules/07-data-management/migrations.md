---
id: data.migrations
triggers:
  - migration
  - schema
  - flyway
  - liquibase
alwaysApply: false
---
# Migrations

> All schema changes via versioned, reversible migrations.

## Rules

- **NEVER** manual prod DB edits — migration tool only.
- Migrations **forward + backward** where tool supports (or documented manual rollback script).
- One logical schema change per migration file.
- Long-running migrations: online strategy (batch backfill, dual-write) — document in ADR.

## Naming

```text
YYYYMMDDHHMMSS_descriptive_snake_case_name.sql
```

## Agent action

When adding column/table, generate migration in same PR as code using it. Include index in migration if queried.
