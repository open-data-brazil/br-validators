---
id: docs.glossary
triggers:
  - glossary
  - ubiquitous-language
  - domain-term
alwaysApply: false
---
# Ubiquitous Language

> One glossary — code, docs, APIs, and agents use identical terms.

## Glossary entry format

```markdown
## TermName

**Definition:** Precise business meaning.
**Not the same as:** Related terms clarified.
**Enum values:** `ValueA`, `ValueB` (if applicable)
**Code name:** Exact identifier used in code (`TermName`)
```

## Rules

- New domain term → glossary entry **before** code merge.
- API paths, DTO fields, class names match glossary (PascalCase/camelCase per language convention).
- **NEVER** translate glossary terms (no `Usuario` if glossary says `User`).

## Agent action

Before introducing public symbol, search glossary. If missing, draft entry and ask user to confirm business definition.
