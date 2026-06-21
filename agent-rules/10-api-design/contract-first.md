---
id: api.contract
triggers:
  - openapi
  - swagger
  - contract
  - schema
alwaysApply: false
---
# Contract First

> Define request/response schema before implementation.

## Workflow

1. OpenAPI / JSON Schema / protobuf for endpoint.
2. Review with glossary term names.
3. Generate or hand-write DTOs from schema.
4. Implement handler + use case.
5. Contract tests validate schema compliance.

## Breaking changes

- Additive: new optional field — same version OK with care.
- Removing/renaming/changing type → **new version** (`/v2/`).
- Document deprecation timeline on old version.

## Error contract

Single structure all endpoints:

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Human-readable safe message",
    "correlationId": "uuid"
  }
}
```

## Agent action

Do not implement endpoint until request/response fields listed explicitly in PR or spec file.
