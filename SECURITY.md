# Security Policy

> BR Validators is a **100% open-source** validation library (MIT).
> Security issues in validation logic are **critical** — a false positive/negative on CPF/CNPJ undermines every downstream system.

---

## Supported versions

| Version | Supported |
|---------|-----------|
| Latest stable (`1.x`) | Yes |
| Previous minor (`1.(x-1)`) | Security fixes only |
| Pre-1.0 (`0.x`) | Best effort during alpha/beta |
| Unreleased `main` | Fix forward; no backports unless critical |

See [docs/VERSIONING.md](docs/VERSIONING.md) for release and support policy.

---

## Reporting a vulnerability

**Do not open a public GitHub issue** for security vulnerabilities.

### Preferred: GitHub Private Security Advisory

1. Go to [github.com/AlexandreZanata/doc-raiz/security/advisories](https://github.com/AlexandreZanata/doc-raiz/security/advisories)
2. Click **Report a vulnerability**
3. Describe the issue with reproduction steps and impact

### Alternative: email

If GitHub advisories are unavailable, email the maintainers with subject `[SECURITY] doc-raiz`:

- Include steps to reproduce
- Affected version(s)
- Impact assessment (e.g. incorrect CNPJ validation accepts invalid input)

We aim to acknowledge within **48 hours** and provide an initial assessment within **5 business days**.

---

## What to report

| In scope | Out of scope |
|----------|--------------|
| Incorrect check-digit algorithm (false accept/reject) | Bugs in consumer apps using this library |
| ReDoS or catastrophic backtracking in regex validators | Social engineering |
| Supply-chain issues in published npm package | Vulnerabilities in devDependencies only |
| Documentation that leads to insecure integration | Missing features (use feature requests) |

---

## Severity (library-specific)

| Severity | Example | Target fix |
|----------|---------|------------|
| **Critical** | Valid CNPJ rejected / invalid CNPJ accepted at scale | Patch release ≤ 72h after official spec confirmation |
| **High** | Wrong behavior on edge case with official test vector | Patch release ≤ 7 days |
| **Medium** | Non-security correctness bug | Next patch/minor |
| **Low** | Documentation or DX issue with security implication | Next minor |

When official agencies (RFB, Bacen) change algorithms, we treat misalignment as **High** minimum until patched.

---

## Disclosure policy

- **Coordinated disclosure** — we request 90 days before public disclosure unless fix is released sooner.
- Credit given in [CHANGELOG.md](CHANGELOG.md) and GitHub advisory (unless reporter prefers anonymity).
- CVE requested for Critical/High when applicable.

---

## Security practices (project)

- Dependencies pinned and audited in CI (when scaffold exists)
- No network I/O in core validators (reduces attack surface)
- Golden test vectors from [official sources](docs/OFFICIAL-SOURCES.md)
- All contributions must be MIT-compatible — see [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md)
- See [docs/SECURITY-PRACTICES.md](docs/SECURITY-PRACTICES.md) for integrator guidance

---

## Secure contribution

Contributors must **not** include:

- Real CPF/CNPJ numbers from production databases in tests (use synthetic/official examples only)
- Secrets, API keys, or `.env` files
- Code under incompatible licenses

See [CONTRIBUTING.md](CONTRIBUTING.md#security-contributions).
