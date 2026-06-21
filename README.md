# doc-raiz / BR Validators

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**100% open-source library** (MIT) for formatting and validating Brazilian document identifiers — CPF, CNPJ (numeric + alphanumeric), CEP, license plates, PIX keys, and more.

Built on official primary sources (Receita Federal, Bacen, CONTRAN, Correios). Wrong check-digit logic destroys trust; this project treats **source traceability** as a first-class requirement.

**For coding agents:** start with **[AGENTS.md](AGENTS.md)** in every new session.

**Language policy:** 100% English — code, docs, comments, commits, and agent output.

---

## Why this project

| Problem | Our approach |
|---------|--------------|
| CNPJ alphanumeric mandatory from **July 2026** | Dual-format support from day one ([CNPJ-ALPHANUMERIC.md](docs/CNPJ-ALPHANUMERIC.md)) |
| Copy-paste validators with wrong modulo 11 | Algorithms tied to [official sources](docs/OFFICIAL-SOURCES.md) |
| Fragmented npm packages | One tree-shakeable library with consistent API |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/VISION.md](docs/VISION.md) | Mission and principles |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | Domain terms |
| [docs/LIBRARY-API.md](docs/LIBRARY-API.md) | Public API contract |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Module layout |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phases and priorities |
| [docs/TECH-STACK.md](docs/TECH-STACK.md) | TypeScript first, npm, ports later |
| [docs/DELIVERY-SURFACES.md](docs/DELIVERY-SURFACES.md) | CLI + Vercel playground |
| [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md) | RFB, Bacen, CONTRAN, Correios |

### Governance

| Doc | Description |
|-----|-------------|
| [LICENSE](LICENSE) | MIT — 100% open source |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](SECURITY.md) | Report vulnerabilities privately |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md) | Open source commitment |
| [docs/VERSIONING.md](docs/VERSIONING.md) | SemVer and release policy |
| [docs/GOVERNANCE.md](docs/GOVERNANCE.md) | Full governance index |

---

## Planned monorepo

```
packages/br-validators/   # npm library (TypeScript)
apps/cli/                 # br-validators terminal — all doc types
apps/playground/          # Vercel web UI — test everything in browser
```

Every identifier ships in **library + CLI + playground**. Details: [docs/DELIVERY-SURFACES.md](docs/DELIVERY-SURFACES.md).

Priority **P0:** CNPJ (numeric + alphanumeric) across all three surfaces.

```bash
# Library
import { validateCnpj } from 'br-validators/cnpj'

# CLI
br-validators cnpj validate 12ABC34501DE35

# Playground
https://br-validators.vercel.app/cnpj   # TBD
```

---

## Quick start (agents)

```bash
pip install -r agent-harness/requirements.txt
./agent-harness/resolve-rules.sh validation domain layer
```

1. Read [docs/NEW-PROJECT-CHECKLIST.md](docs/NEW-PROJECT-CHECKLIST.md)
2. Implement only algorithms with entries in [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md)

---

## Agent harness

This repo uses the [Good Practices for LLMs and Agents](https://github.com/AlexandreZanata/GoodPraticesForLLMSandAgents) harness (`agent-rules/`, `agent-harness/`, `.cursor/rules/`).

Local overrides: `.local/overrides/` (gitignored).

---

## License

[MIT](LICENSE) — permanently free and open source. See [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md).

Commercial use, modification, and distribution allowed. No paid tier for core validation.
