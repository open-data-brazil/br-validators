---
id: clean.comments
triggers:
  - comment
  - docstring
  - documentation
alwaysApply: false
---
# Comments and Documentation

> Comments explain **why**; code and names explain **what**.

## Comments

- MUST explain non-obvious business rules, security constraints, or performance tradeoffs.
- MUST NOT restate what the code obviously does.
- MUST NOT leave commented-out code — delete it (git history exists).
- TODO comments MUST include ticket/issue reference or be forbidden.

## Public API documentation

- All public functions, classes, and HTTP endpoints MUST have docstrings or OpenAPI descriptions.
- Document preconditions, thrown errors, and side effects for Application/Domain public APIs.
- Domain business rules reference BR code in docstring when applicable (`@see BR-001`).

## Internal docs

- Architecture decisions → ADR (see `11-documentation-and-glossary/adr-template.md`).
- Domain terms → glossary (see `ubiquitous-language.md`).

## Language

- 100% English in all comments and docs in this repository.

## Agent action

If you write a comment longer than 3 lines explaining **what**, rename or refactor instead.
