---
id: test.pyramid
triggers:
  - test-pyramid
  - e2e
  - integration
  - unit-test
alwaysApply: false
---
# Test Pyramid

> Agents over-generate E2E — enforce explicit ratio caps.

## Target ratio

```text
Unit:        75%  — domain entities, value objects, state machines, pure logic
Integration: 20%  — use cases + real adapter fakes/in-memory DB
E2E:          5%  — critical user journeys only
```

## What belongs where

| Layer | Test type | Examples |
|-------|-----------|----------|
| Domain | Unit | `Order.submit()` raises on invalid state |
| Application | Integration | `SubmitOrderHandler` persists + publishes event |
| Infrastructure | Integration | Repository round-trip with test DB |
| Full stack | E2E | Login → create resource → verify API response |

## Caps

- **Max 1 E2E test per user story** unless compliance requires more.
- Do not write E2E when integration test suffices.
- Do not hit real external APIs in unit tests.

## Agent action

When asked to "add tests", default to unit tests for domain changes. Propose E2E only for new critical flows.
