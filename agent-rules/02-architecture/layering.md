---
id: arch.layering
triggers:
  - layer
  - domain
  - application
  - infrastructure
  - controller
alwaysApply: false
---
# Layering

> Strict layer separation with dependencies pointing inward.

## Layer stack

```text
INTERFACES        → HTTP, WebSocket, CLI, UI (delivery only)
APPLICATION       → use cases, handlers, authorization orchestration
DOMAIN            → entities, aggregates, value objects, domain events, state machines
INFRASTRUCTURE    → DB, cache, external APIs, queues (implements ports)
```

## Dependency rule

Inner layers NEVER import outer layers.

| Layer | MAY depend on | MUST NOT depend on |
|-------|---------------|---------------------|
| Domain | nothing external | Application, Infrastructure, Interfaces |
| Application | Domain | Infrastructure concretions, HTTP frameworks |
| Infrastructure | Domain ports, Application ports | Interface controllers |
| Interfaces | Application | Domain internals directly (go through use cases) |

## Interface layer rules

- Controllers/handlers: parse input → call use case → map output. **No business logic.**
- No direct repository/DB access from controllers.
- DTO mapping at boundary — never expose domain entities on wire.

## Agent action

Before adding an import, VERIFY dependency direction. If Domain needs data, define a port interface in Domain; implement in Infrastructure.
