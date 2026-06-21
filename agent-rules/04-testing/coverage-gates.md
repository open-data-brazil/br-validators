---
id: test.coverage
triggers:
  - coverage
  - threshold
  - gate
alwaysApply: false
---
# Coverage Gates

> Numeric thresholds per layer — domain highest.

## Minimum thresholds

| Layer | Coverage target |
|-------|-----------------|
| Domain (entities, VOs, state machines) | **≥ 90%** |
| State machine transitions | **100%** valid + invalid paths |
| Application use cases | ≥ 80% |
| Infrastructure adapters | ≥ 70% (focus on mapping and error paths) |
| Interface/controllers | Thin — integration tests preferred over coverage % |

## CI enforcement

- Block merge if Domain coverage drops below threshold on changed files (diff coverage).
- Exemptions require ADR or ticket comment — not silent `@ignore`.

## Agent action

When adding domain rule, add tests until branch coverage on that file meets gate. Report coverage if tooling available.
