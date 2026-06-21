---
id: sec.mass-assignment
triggers:
  - mass-assignment
  - dto
  - exposure
  - serialize
alwaysApply: false
---
# Mass Assignment and Data Exposure

> Explicit field allow-lists; never bind raw request to domain models.

## Input (mass assignment)

- Define **request DTO** with only client-settable fields.
- NEVER `bind(request.body, DomainEntity)` — attackers add `role: admin`, `isVerified: true`.
- Use command objects with explicit fields mapped in Application layer.

## Output (data exposure)

- Define **response DTO** per endpoint — never serialize full internal entity/ORM model.
- Exclude: internal IDs not needed by client, password hashes, tokens, PII not required for view.
- Consistent 404/403 policy to avoid enumeration (document choice per resource).

## Agent action

Review every new endpoint for fields returned and accepted. List them explicitly in OpenAPI/schema.
