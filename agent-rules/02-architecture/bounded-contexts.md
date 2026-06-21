---
id: arch.contexts
triggers:
  - bounded-context
  - module-boundary
  - ddd
alwaysApply: false
---
# Bounded Contexts

> Explicit module/service boundaries; no shared mutable state across contexts.

## Rules

- Each bounded context owns its aggregates and persistence.
- Contexts communicate via domain events, public APIs, or anti-corruption layers — not shared DB tables with coupled writes.
- Duplicate concepts across contexts are OK (e.g. `Customer` in Billing vs `Customer` in Support) — map explicitly at boundaries.
- Shared kernel only for truly stable, small value types — never for mutable entities.

## Anti-patterns (NEVER)

- "God module" importing everything.
- Cross-context direct database joins for write paths.
- Circular dependencies between context packages.

## Agent action

Before importing from another module, ask: same bounded context? If no, use published interface or event contract only.
