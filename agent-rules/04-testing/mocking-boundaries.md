---
id: test.mocking
triggers:
  - mock
  - fake
  - stub
  - spy
alwaysApply: false
---
# Mocking Boundaries

> Mock external I/O only — never mock the system under test.

## Mock / fake

- Database (in-memory or test container)
- HTTP external APIs
- Message queue
- Filesystem
- Clock / random (when testing time-sensitive logic)

## Do NOT mock

- The class/function under test
- Domain entities to "force" state — build real aggregate instead
- Value Object validation — test real constructors

## Prefer

- **Fakes** over mocks when behavior matters (in-memory repo implementing port).
- **Spies** on event publisher to assert events raised — not mock entire domain.

## Agent action

If test only passes because mock returns canned data unrelated to domain rules, rewrite test against real domain object.
