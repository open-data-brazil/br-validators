---
id: docs.adr
triggers:
  - adr
  - architecture-decision
alwaysApply: false
---
# ADR Template

> Architecture Decision Record for non-trivial technical choices.

## When to write ADR

- New dependency/framework adoption
- Security model choice
- Breaking API or schema strategy
- Tradeoff affecting multiple teams (caching, event bus, auth provider)

## Template

```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Date:** YYYY-MM-DD
**Deciders:** names/roles

## Context

What problem forces a decision?

## Decision

What we chose — one clear statement.

## Consequences

### Positive
- ...

### Negative
- ...

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| A | ... |
| B | ... |
```

## Location

`docs/adr/ADR-NNN-short-title.md` per project.

## Agent action

When user asks for architectural fork, draft ADR before implementing — not after.
