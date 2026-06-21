# Project governance

> How **BR Validators** (doc-raiz) is organized — license, security, versioning, and contributions.

---

## Document map

| Area | Root | Deep dive |
|------|------|-----------|
| **License (MIT)** | [LICENSE](../LICENSE) | [OPEN-SOURCE.md](OPEN-SOURCE.md) |
| **Contributing** | [CONTRIBUTING.md](../CONTRIBUTING.md) | [NEW-PROJECT-CHECKLIST.md](NEW-PROJECT-CHECKLIST.md) |
| **Security reporting** | [SECURITY.md](../SECURITY.md) | [SECURITY-PRACTICES.md](SECURITY-PRACTICES.md) |
| **Versioning / releases** | [CHANGELOG.md](../CHANGELOG.md) | [VERSIONING.md](VERSIONING.md) |
| **Code of conduct** | [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) | — |
| **Public API** | — | [LIBRARY-API.md](LIBRARY-API.md) |
| **Agents** | [AGENTS.md](../AGENTS.md) | [docs/README.md](README.md) |

---

## Core commitments

1. **100% open source** — MIT forever for core validators ([OPEN-SOURCE.md](OPEN-SOURCE.md))
2. **Official algorithms only** — [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md)
3. **SemVer** — [VERSIONING.md](VERSIONING.md)
4. **Security-first validation** — wrong check digit = security bug ([SECURITY.md](../SECURITY.md))
5. **English only** — code, docs, commits

---

## Release lifecycle

```
main branch
    │
    ├── PR (CONTRIBUTING.md checklist)
    │
    ├── CHANGELOG [Unreleased]
    │
    ├── Version bump + tag vX.Y.Z
    │
    ├── npm publish (public)
    │
    └── GitHub Release + security advisory if needed
```

---

## Roles

| Role | Duties |
|------|--------|
| **Maintainer** | Review PRs, releases, security advisories |
| **Contributor** | PRs under MIT + CONTRIBUTING rules |
| **Security researcher** | Private report via SECURITY.md |
| **Integrator** | Follow SECURITY-PRACTICES.md in apps |

---

## Decision log

| Date | Decision | ADR |
|------|----------|-----|
| 2026-06 | MIT license, 100% OSS, no open core | [OPEN-SOURCE.md](OPEN-SOURCE.md) |
| 2026-06 | SemVer from first npm publish; pre-1.0 at 0.1.0-alpha | [VERSIONING.md](VERSIONING.md) |
| 2026-06 | Private security advisories via GitHub | [SECURITY.md](../SECURITY.md) |

Future architectural decisions: add ADR in `docs/adr/` using [agent-rules/11-documentation-and-glossary/adr-template.md](../agent-rules/11-documentation-and-glossary/adr-template.md).
