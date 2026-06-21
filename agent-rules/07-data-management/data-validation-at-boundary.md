---
id: data.boundary
triggers:
  - boundary
  - mapping
  - dto
alwaysApply: false
---
# Data Validation at Boundary

> Validate shape and types at every layer crossing.

## Boundaries

```text
HTTP in  → DTO validation → Command → Value Objects
DB out   → Row mapping → Domain types (never leak raw driver types upward)
Event in → Schema version check → Domain command
```

## Rules

- Invalid data **rejected at outermost boundary** — do not propagate `string` where `Email` VO expected.
- Use schema validation (JSON Schema, OpenAPI, class validators) at API edge.
- Domain Value Objects re-validate invariants — do not trust inner layers blindly.

## Agent action

Map external input to typed command in Interface layer; construct Value Objects in Application before domain operation.
