---
id: sec.injection
triggers:
  - injection
  - sql
  - xss
  - eval
alwaysApply: false
---
# Injection Prevention

> Parameterized queries and no dynamic execution on user input.

## Rules

- **SQL:** parameterized queries / prepared statements ONLY — never string-concat SQL with user input.
- **NoSQL:** use driver parameter binding; never inject raw user strings into query objects.
- **HTML/XSS:** escape or sanitize on output encoding context; prefer framework auto-escaping in templates.
- **Command/shell:** never pass user input to shell; if unavoidable, strict allow-list + exec without shell.
- **NEVER** `eval`, `Function()`, dynamic template compilation on user-controlled strings.

## LDAP, XPath, template injection

- Use library APIs with parameter binding.
- Treat structured query languages like SQL — no string interpolation.

## Agent action

Search codebase for string concatenation near query/exec calls. Flag and fix in security-related changes.
