---
id: clean.functions
triggers:
  - function
  - method
  - parameter
  - refactor
alwaysApply: false
---
# Functions

> Small, single-purpose functions reduce agent and human error rates.

## Limits

| Metric | Target | Hard cap |
|--------|--------|----------|
| Lines per function | ≤ 20 | ≤ 30 |
| Parameters | ≤ 3 | ≤ 4 |
| Return points | 1–2 (early guard + main) | 3 |

## Rules

- **Single responsibility:** one reason to change per function.
- **No boolean flag parameters** — split into two named functions instead of `save(order, sendEmail: bool)`.
- **Pure functions** in Domain when possible — same input, same output, no side effects.
- Side effects (I/O, mutations) belong in Application or Infrastructure, called explicitly.

## Structure

```text
1. Guard clauses (validate preconditions, return/throw early)
2. Main logic (flat, minimal nesting)
3. Single exit or explicit throw
```

## Agent action

If a generated function exceeds 30 lines or 4 params, **split before submitting** — do not leave "TODO: refactor" comments.
