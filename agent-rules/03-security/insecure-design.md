---
id: sec.insecure-design
triggers:
  - insecure-design
  - threat-model
  - abuse-case
  - owasp
  - a06
alwaysApply: false
---
# Insecure Design

> OWASP A06:2025 — flaws in architecture and design, not implementation bugs alone.

## Agent one-liners

- Threat model before implementing auth, payments, or multi-tenant features.
- Secure-by-default: deny until explicitly allowed.
- Design abuse cases (malicious user, compromised token) in use case docs.
- Never add "temporary" insecure shortcut without ADR and expiry date.

## MUST

- Document trust boundaries in ADR for new subsystems.
- Rate-limit and auth on every externally reachable endpoint by design — not bolt-on later.
- Separate admin and user APIs at design level (BFLA prevention).
- Privacy and data minimization in design — not post-hoc scrubbing.

## MUST NOT

- Build feature first, "add security later".
- Trust client-side validation as sole control.
- Design flows that require secrets in client bundles.

## Agent action

New feature touching identity, money, or PII → check insecure design checklist before code:
- [ ] Abuse cases documented
- [ ] Trust boundaries drawn
- [ ] Fail-closed on auth errors
- [ ] Least privilege in design

See also: `authorization.md`, `insecure-design` ADR template in `../11-documentation-and-glossary/adr-template.md`.
