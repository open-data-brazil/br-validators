---
id: ai.verify
triggers:
  - incremental
  - lint
  - verify
alwaysApply: false
---
# Incremental Verification

> Run smallest check after each meaningful change — do not batch 10 edits then discover failure at step 3.

## Loop

```text
1. Make one logical edit (or small group)
2. Run smallest verification:
   - syntax/lint on touched file
   - single focused test
   - typecheck if applicable
3. If fail → fix before next edit
4. Repeat
```

## Verification sizing

| Change | Minimum check |
|--------|---------------|
| Domain rule | Unit test for that rule |
| New endpoint | Contract test or handler test |
| Refactor | Existing tests in module |
| Config | Validate schema / dry-run |

## Agent action

Do not end turn with "run tests locally" without having run them when environment allows.
