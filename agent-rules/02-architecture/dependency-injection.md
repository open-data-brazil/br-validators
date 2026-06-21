---
id: arch.di
triggers:
  - di
  - injection
  - port
  - adapter
  - interface
alwaysApply: false
---
# Dependency Injection

> Depend on abstractions; wire concretions at the composition root.

## Rules

- **Constructor injection** preferred — dependencies visible and required.
- **NEVER** service locator / global singleton registry for domain or application services.
- Domain defines **ports** (interfaces); Infrastructure provides **adapters**.
- Application handlers receive use case dependencies via constructor/factory.

## Composition root

- Single place (main, DI container bootstrap) wires implementations to interfaces.
- Interfaces layer receives already-constructed use cases — does not `new` repositories.

## Testing

- Replace adapters with fakes/in-memory implementations at test composition root.
- Do not use DI framework magic in unit tests if it hides dependencies.

## Agent action

When adding a new external dependency (DB, HTTP client), define port in Domain/Application first, implement adapter second, register in composition root third.
