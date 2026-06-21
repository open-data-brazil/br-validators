---
id: sec.supply-chain
triggers:
  - dependency
  - supply-chain
  - npm
  - package
  - cve
  - typosquat
alwaysApply: false
---
# Supply Chain Security

> OWASP 2025 — Software Supply Chain Failures (replaces "Vulnerable Components").

## Before adding a dependency

- [ ] Is it necessary? Can stdlib or existing package suffice?
- [ ] Pin version explicitly in manifest.
- [ ] Check maintainer reputation, last publish date, download stats anomalies.
- [ ] Watch for **typosquatting** (similar name to popular package).
- [ ] Run audit scan (`npm audit`, `pip-audit`, `govulncheck`, etc.).

## Lockfiles and integrity

- Commit lockfile; use lockfile in CI for reproducible installs.
- Verify integrity hashes where package manager supports them.
- Pin transitive risk — review major dependency upgrades in isolated PR.

## CI

- Automated dependency vulnerability scan on every PR.
- Block merge on critical CVE unless documented exception with expiry.

## Agent action

NEVER add dependency without stating name, version, and purpose in PR description. Prefer well-maintained, widely used libraries.
