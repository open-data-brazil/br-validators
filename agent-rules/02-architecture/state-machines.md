---
id: arch.state-machines
triggers:
  - state
  - status
  - transition
  - workflow
  - fsm
alwaysApply: false
---
# State Machines

> Any multi-status entity MUST have an explicit, documented state machine in Domain.

## Requirements

- States: finite enumerated set (enum or sealed type).
- Transitions: explicit table `(from, trigger, to, allowedRole?)`.
- Invalid transitions: throw domain exception — **never silent ignore**.
- Terminal states: no outgoing transitions.

## Documentation format

```text
Entity: Order
States: Draft | Submitted | Approved | Rejected | Cancelled
Terminal: Rejected, Cancelled

Transitions:
  Draft      + submit()   → Submitted   (Owner)
  Submitted  + approve()  → Approved    (Admin)
  Submitted  + reject()   → Rejected    (Admin)
  Draft      + cancel()   → Cancelled   (Owner)
```

## Implementation

- Transition logic lives on Aggregate Root or dedicated state machine type in Domain.
- Application layer invokes `aggregate.transition(trigger)` — does not set state field directly.
- Infrastructure persists current state; does not compute next state.

## Testing

- 100% coverage of valid transitions.
- Every invalid transition has a test expecting domain exception.

## Agent action

If adding a new status field to an entity, STOP — define state machine first, then implement.
