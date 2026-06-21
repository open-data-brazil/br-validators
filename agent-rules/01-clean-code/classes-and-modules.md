---
id: clean.classes
triggers:
  - class
  - module
  - solid
  - srp
  - dip
alwaysApply: false
---
# Classes and Modules

> SOLID principles as agent-actionable one-liners.

## SOLID

| Principle | Agent rule |
|-----------|------------|
| **SRP** | One class/module = one reason to change. Split if you describe it with "and". |
| **OCP** | Extend via new types/strategies; do not edit stable core for every new variant. |
| **LSP** | Subtypes must honor parent contracts — no surprise throws or weakened preconditions. |
| **ISP** | Small interfaces; clients depend only on methods they use. |
| **DIP** | Depend on abstractions (interfaces/ports); inject concretions at composition root. |

## Module boundaries

- **Domain:** entities, value objects, domain services, state machines, domain events — zero framework imports.
- **Application:** use case handlers, orchestration, authorization checks — depends on Domain ports.
- **Infrastructure:** DB repos, HTTP clients, message brokers — implements Domain/Application ports.
- **Interfaces:** controllers, CLI, UI — thin adapters; no business rules.

## Class size

- Prefer many small types over few large ones.
- If a class exceeds ~200 lines, evaluate split by responsibility before adding more methods.

## Agent action

Before adding a method to an existing class, ask: "Does this belong to the same reason to change?" If no, create a new type.
