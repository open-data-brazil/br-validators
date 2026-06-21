---
id: arch.events
triggers:
  - event
  - domain-event
  - outbox
  - publish
alwaysApply: false
---
# Domain Events

> Past-tense immutable facts for cross-context communication.

## Naming

- Past tense: `OrderPlaced`, `PaymentCaptured`, `UserDeactivated`.
- NEVER present/future tense (`PlaceOrder`, `WillShip`).

## Rules

- Raised by entity/aggregate when business fact occurs — not by Application layer directly.
- Immutable after creation — no edit, no delete.
- Payload: event ID, aggregate ID, timestamp, tenant/context, minimal relevant data.
- Cross-context integration via events or outbox — **never** direct cross-domain service calls mutating foreign aggregates.

## Application responsibilities

- Collect events from aggregate after successful command.
- Dispatch to event bus / outbox publisher.
- Do not construct domain events with fake data to "trigger" side effects.

## Infrastructure

- At-least-once delivery assumed — handlers MUST be idempotent.
- Store event log for audit and replay where required.

## Agent action

When implementing side effects in another context, subscribe to event — do not call the other module's repository.
