---
id: clean.dry
triggers:
  - dry
  - duplication
  - abstract
  - extract
alwaysApply: false
---
# DRY vs Duplication

> Premature abstraction is as harmful as unchecked duplication.

## Rule of three

- **1st occurrence:** implement inline.
- **2nd occurrence:** tolerate duplication if contexts differ meaningfully.
- **3rd identical occurrence:** extract shared abstraction.

## When NOT to deduplicate

- Similar-looking code with different business rules or change rates.
- Duplication across bounded contexts — prefer explicit mapping over shared mutable modules.
- "Utility grab bag" modules that accumulate unrelated helpers.

## When to deduplicate

- Identical invariant validation (e.g. email format) — Value Object in Domain.
- Identical infrastructure pattern (HTTP retry) — single adapter utility.
- Identical test setup — fixture/factory, not copy-paste arrange blocks.

## Agent action

Do not create `utils/` helpers for one-off logic. Do create Value Objects for repeated domain validation.
