---
id: clean.complexity
triggers:
  - complexity
  - cyclomatic
  - nesting
  - refactor
alwaysApply: false
---
# Complexity

> Cognitive and cyclomatic complexity caps keep code agent-parseable and human-reviewable.

## Hard limits

| Metric | Target | Hard cap |
|--------|--------|----------|
| Cyclomatic complexity | ≤ 5 | **≤ 10** |
| Nesting depth | ≤ 2 | **≤ 3** |
| Branch count per function | ≤ 4 | ≤ 6 |

## Techniques (prefer in order)

1. **Guard clauses** — early return/throw instead of nested if/else.
2. **Lookup tables / maps** — replace long switch/if chains for dispatch.
3. **Extract function** — name the branch logic, call it.
4. **Polymorphism / strategy** — when behavior varies by type, not by flag.

## NEVER

- Deep nesting (> 3 levels) to "save lines"
- Complex ternary chains
- Logic duplicated across branches — extract shared path

## Agent action

When implementing conditional logic, count branches. If approaching 10 cyclomatic complexity, refactor **in the same change** using guard clauses or extraction.

Tools: run project linter complexity rules if configured; otherwise self-check before commit.
