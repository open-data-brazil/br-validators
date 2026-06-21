---
id: devops.rollback
triggers:
  - rollback
  - deploy
  - release
alwaysApply: false
---
# Rollback Readiness

> Every deploy must be revertible without data loss.

## Requirements

- **Backward-compatible migrations** when possible — rollback deploy should not require irreversible DB state.
- Destructive migrations: two-phase deploy with rollback runbook.
- Feature flags allow disabling bad behavior without redeploy.
- Database backups verified before risky migrations.

## Runbook item

```text
ROLLBACK:
1. Revert deployment to version X
2. If migration N applied: [down migration OR compensating script]
3. Verify health checks
4. Feature flag OFF: [name]
```

## Agent action

When shipping destructive schema change, document rollback steps in PR — not "we'll figure it out".
