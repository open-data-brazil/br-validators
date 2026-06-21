---
id: sec.encryption
triggers:
  - encryption
  - tls
  - crypto
  - at-rest
alwaysApply: false
---
# Encryption

> TLS in transit; vetted libraries at rest; never roll your own crypto.

## In transit

- **TLS everywhere** — external and internal service calls in production.
- HSTS enabled (see `security-misconfiguration.md`).
- Certificate validation enabled — no `verify=False` in production.

## At rest

- Encrypt sensitive fields or volumes: PII, credentials, payment data, health data.
- Keys in KMS/secret manager — not in application config beside ciphertext.

## Application crypto

- Use vetted libraries only (libsodium, platform KMS, framework crypto).
- **NEVER** implement custom ciphers, MACs, or key derivation.

## Agent action

If task requires encryption, specify algorithm/library from project standard — do not invent scheme.
