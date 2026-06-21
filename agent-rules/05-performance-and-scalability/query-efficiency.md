---
id: perf.query
triggers:
  - query
  - n+1
  - database
  - sql
  - index
alwaysApply: false
---
# Query Efficiency

> No N+1; paginate lists; batch explicitly.

## Rules

- **Detect N+1:** loop + query inside loop is forbidden — use eager load, join, or batch fetch.
- **Paginate** any list endpoint expected to exceed **50 items** default page size.
- **Select only needed columns** — no `SELECT *` on large tables in hot paths.
- **Index** columns used in WHERE/ORDER BY — add migration with index when adding filter.

## Agent action

When adding list + detail relationship in handler, use single query or documented batch strategy. Mention query plan in PR if complex.
