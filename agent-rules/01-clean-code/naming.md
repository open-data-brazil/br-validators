---
id: clean.naming
triggers:
  - naming
  - rename
  - identifier
  - glossary
alwaysApply: false
---
# Naming

> Intent-revealing names are the primary documentation.

## Rules

- Names MUST reveal **why** something exists, not **how** it is implemented.
- Functions/methods: **verb-first** (`createOrder`, `isEligible`, `findActiveSessions`).
- Booleans: **predicate form** (`isActive`, `hasPermission`, `canTransitionTo`).
- Classes/types: **noun phrase** matching domain glossary (`Order`, `TenantId`, not `OrderManagerHelper`).
- Constants: `SCREAMING_SNAKE` for true constants; avoid magic numbers — name them.
- Avoid abbreviations except glossary acronyms (`RBAC`, `UUID`).

## Domain alignment

- Use glossary terms **exactly** — no synonyms (`User` vs `Customer` if glossary says `Customer`).
- Enums: singular type name, PascalCase members matching business vocabulary.

## Anti-patterns (NEVER)

- `data`, `info`, `temp`, `obj`, `handleStuff`, `processData`
- Hungarian notation (`strName`, `iCount`)
- Encoding type in name unless disambiguating (`userIdString` only when multiple ID types coexist)

## Agent action

Before introducing a new public symbol, VERIFY term exists in glossary. If not, add glossary entry in same change or ask user.
