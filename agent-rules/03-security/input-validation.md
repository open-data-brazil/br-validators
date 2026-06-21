---
id: sec.input
triggers:
  - validation
  - input
  - sanitize
  - allow-list
alwaysApply: false
---
# Input Validation

> Allow-lists at every trust boundary. Reject — do not sanitize-and-continue on critical paths.

## Trust boundaries

- HTTP/API request body and query params
- Message queue payloads
- File uploads
- Webhook callbacks
- CLI arguments

## Rules

- **Allow-list** acceptable values (types, lengths, formats, enums) — not deny-list of "bad" patterns alone.
- Validate **before** domain operations — at Interface + Application boundary.
- Critical paths: invalid input → 400 with structured error — never partial processing.
- Normalize once at boundary (trim, case rules) — domain receives clean types (Value Objects).

## Domain vs boundary

- Format validation (email shape) → Value Object constructor.
- Authorization / business eligibility → Application + Domain rules.

## Agent action

Never bind raw request body directly to domain entity. Map DTO → command → domain types.
