---
id: api.rest
triggers:
  - api
  - rest
  - endpoint
  - http
  - controller
  - route
alwaysApply: false
---
# REST Conventions

> Domain-named resources; correct verbs and status codes; versioned from day one.

## URL design

```text
/v1/{resources}           GET list, POST create
/v1/{resources}/{id}      GET one, PUT/PATCH update, DELETE remove
/v1/{resources}/{id}/{sub}  sub-resource when nested lifecycle
```

- **Plural nouns** from glossary (`/orders`, not `/getOrders`).
- **No verbs in paths** (`/orders/{id}/cancel` as action sub-resource is OK if domain language uses it).

## HTTP verbs

| Verb | Idempotent | Safe | Use |
|------|------------|------|-----|
| GET | yes | yes | Read |
| POST | no* | no | Create, commands (*with idempotency key) |
| PUT | yes | no | Full replace |
| PATCH | yes | no | Partial update |
| DELETE | yes | no | Remove |

## Status codes

| Code | When |
|------|------|
| 200 | Success with body |
| 201 | Created |
| 204 | Success no body |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (authenticated) |
| 404 | Not found (or hidden) |
| 409 | Conflict (state/version) |
| 422 | Semantic domain error |
| 429 | Rate limited |
| 500 | Unexpected server error — no internals in body |

## Agent action

New API → define OpenAPI snippet + version prefix `/v1/` before handler implementation.
