---
id: sec.owasp-index
triggers:
  - owasp
  - owasp2025
  - top10
  - security-review
alwaysApply: false
---
# OWASP Top 10:2025

> Current OWASP web application standard (finalized January 2026). Stack-agnostic agent rules.

## A01 — Broken Access Control (#1)

- Default-deny authorization: `authorization.md`
- BOLA: verify object-level access on every `{id}` route
- BFLA: verify function-level permission — admin APIs not reachable by standard roles
- SSRF: `ssrf-and-access-control.md` (SSRF merged into access control in 2025)
- Tenant isolation on every request

**Agent one-liners:**
- `Never return resource by ID without object-level auth check`
- `Never expose admin function to lower-privilege role (BFLA)`

## A02 — Security Misconfiguration (#2)

→ `security-misconfiguration.md`

- No debug in production; security headers; no default credentials

## A03 — Software Supply Chain Failures (#3, new)

→ `supply-chain-security.md`

- Pin deps; audit before add; lockfile integrity; typosquat checks

## A04 — Cryptographic Failures (#4)

→ `encryption.md`, `secrets-and-credentials.md`

- TLS everywhere; vetted crypto only; no hardcoded secrets

## A05 — Injection (#5)

→ `injection-prevention.md`, `input-validation.md`

- Parameterized queries; no eval on user input

## A06 — Insecure Design (#6)

→ `insecure-design.md`

- Threat model before build; secure defaults; abuse case tests

## A07 — Authentication Failures (#7)

→ `authentication.md`

- OAuth2/OIDC; MFA for elevated roles; short-lived tokens

## A08 — Software or Data Integrity Failures (#8)

→ `software-data-integrity.md`

- Verify signatures on artifacts; CI/CD pipeline integrity; no unsigned updates

## A09 — Security Logging and Alerting Failures (#9)

→ `audit-logging.md`, `../06-reliability-and-observability/monitoring-and-alerting.md`

- Log security events AND alert on them — logging alone is insufficient

## A10 — Mishandling of Exceptional Conditions (#10, new)

→ `../01-clean-code/error-handling.md`, `../06-reliability-and-observability/exception-handling-discipline.md`

- Handle null, timeout, partial failure explicitly; never fail open on auth

## Cross-reference

Full file index: `README.md` in this folder.
