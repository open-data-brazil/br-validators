---
id: sec.integrity
triggers:
  - integrity
  - signature
  - deserialization
  - webhook
  - owasp
  - a08
alwaysApply: false
---
# Software and Data Integrity Failures

> OWASP A08:2025 — trust boundaries and integrity of software, code, and data artifacts.

## Agent one-liners

- Verify signatures on downloaded binaries, packages, and container images.
- CI/CD pipeline must not accept unsigned or unreviewed deploy artifacts.
- Never auto-apply agent-generated migrations without human review.
- Deserialize untrusted data with safe formats only — no pickle/eval on external input.

## MUST

- Lockfile + integrity hashes for dependencies (see `supply-chain-security.md`).
- Signed commits or signed release artifacts where org policy requires.
- Webhook payloads verified (HMAC/signature) before processing.
- OTA/config updates from trusted source with version pinning.

## MUST NOT

- `curl | bash` from unverified URL in prod setup docs without checksum verify.
- Load plugins/MCP servers without provenance check.
- Trust `latest` tag in production deploy pipelines.

## Distinction from A03

| A03 Supply Chain | A08 Integrity |
|------------------|---------------|
| Dependency choice, typosquat, CVE | Runtime verification, signatures, deserialization |
| Third-party packages | Your build output and data pipelines |

## Agent action

When adding webhook, plugin loader, or auto-update → add integrity verification in same PR.
