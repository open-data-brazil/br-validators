# Changelog

All notable changes to **BR Validators** (doc-raiz) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**License:** MIT — 100% open source. See [LICENSE](LICENSE) and [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md).

---

## [Unreleased]

### Added

- n/a

---

## [0.1.0-beta.0] - 2026-06-21

CPF validator across library, CLI, and playground.

### Added

- `packages/br-validators` — CPF numeric modulo 11 (golden vectors `12345678909`, `11144477735`)
- Subpath export `br-validators/cpf`
- `apps/cli` — `br-validators cpf validate|format|strip` with `--json`, `--quiet`, `--source`
- `apps/playground` — client-side tester at `/cpf`
- CI: Node 24, pnpm version from `packageManager` field only

### Security

- Validation aligned to [RFB CPF portal](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) and UC-001 golden vector

---

## [0.1.0-alpha.1] - 2026-06-21

First implementation release — CNPJ validator across library, CLI, and playground.

### Added

- `packages/br-validators` — CNPJ numeric + alphanumeric (RFB Q14 golden vector `12ABC34501DE35`)
- `apps/cli` — `br-validators cnpj validate|format|strip` with `--json`, `--quiet`, `--source`
- `apps/playground` — Next.js client-side tester at `/cnpj`
- Monorepo (pnpm workspaces) + GitHub Actions CI
- 100% test coverage on library and CLI core

### Security

- Validation algorithms aligned to [RFB CNPJ alfanumérico PDF](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf)

---

## [0.1.0-alpha.0] - 2026-06-21

Documentation, governance, and agent harness bootstrap (no npm code yet).

### Added

- Project documentation (`docs/`) — vision, glossary, architecture, official sources
- [docs/TECH-STACK.md](docs/TECH-STACK.md) — TypeScript first, branded types, port strategy
- [docs/DELIVERY-SURFACES.md](docs/DELIVERY-SURFACES.md) — library + CLI + Vercel playground per doc type
- [docs/CNPJ-ALPHANUMERIC.md](docs/CNPJ-ALPHANUMERIC.md) — RFB Q14 golden vector `12ABC34501DE35`
- MIT [LICENSE](LICENSE)
- [SECURITY.md](SECURITY.md) — vulnerability reporting policy
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution and security contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md) — permanent open source commitment
- [docs/VERSIONING.md](docs/VERSIONING.md) — SemVer and release policy
- [docs/SECURITY-PRACTICES.md](docs/SECURITY-PRACTICES.md) — integrator security guidance
- [docs/GOVERNANCE.md](docs/GOVERNANCE.md) — document map and decision log
- Agent harness (`agent-rules/`, `agent-harness/`, `.cursor/rules/`)
- Root [VERSION](VERSION) file

---

## Version history

| Version | Date | Notes |
|---------|------|-------|
| [0.1.0-beta.0](https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-beta.0) | 2026-06-21 | CPF library + CLI + playground |
| [0.1.0-alpha.1](https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-alpha.1) | 2026-06-21 | CNPJ library + CLI + playground |
| [0.1.0-alpha.0](https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-alpha.0) | 2026-06-21 | Docs + harness bootstrap |

See [docs/VERSIONING.md](docs/VERSIONING.md) for versioning rules.

[Unreleased]: https://github.com/AlexandreZanata/doc-raiz/compare/v0.1.0-beta.0...HEAD
[0.1.0-beta.0]: https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-beta.0
[0.1.0-alpha.1]: https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-alpha.1
[0.1.0-alpha.0]: https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-alpha.0
