---
id: arch.coupling
triggers:
  - coupling
  - cohesion
  - decouple
alwaysApply: false
---
# Coupling and Cohesion

> High cohesion inside modules; low coupling between modules.

## Cohesion

- Module contents change together for one business capability.
- If a file is edited every time an unrelated feature changes, it likely violates SRP.

## Coupling heuristic

> If changing module A requires changing module B **>50% of the time**, they are not properly decoupled.

**Action:** introduce interface, event, or merge into same bounded context — do not leave hidden coupling.

## Allowed coupling

- Domain ← nothing
- Application → Domain
- Infrastructure → Domain ports
- Interfaces → Application

## Forbidden coupling

- Domain → Infrastructure
- Infrastructure → Interfaces
- Context A → Context B internal packages

## Agent action

After implementing a feature touching 3+ modules, review coupling heuristic. Refactor boundaries if co-change rate is high.
