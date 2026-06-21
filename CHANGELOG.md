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

## [0.3.0-alpha.0] - 2026-06-21

Credit card PAN validator across library, CLI, and playground.

### Added

- `packages/br-validators` — credit card PAN validation: Luhn / ISO/IEC 7812-1 Annex B
- `validateCartaoCredito`, `isValidLuhn`, `detectCardBrand`, strip/format
- PAN length 8–19; best-effort brand (Visa, Mastercard, Amex, Elo, Hipercard)
- Subpath export `br-validators/cartao-credito`
- `apps/cli` — `br-validators cartao validate|detect|format|strip`
- `apps/playground` — `/cartao` route with validate + brand row
- UC-008, BR-LUHN-001…008, golden vectors (Visa/MC/Amex + Luhn walkthrough)

---

Boleto validator across library, CLI, and playground.

### Added

- `packages/br-validators` — boleto validation: linha digitável (47) + código de barras (44)
- `detectBoletoInputKind`, `validateBoleto`, conversion linha ↔ barcode
- Modulo 10 field DVs + modulo 11 barcode DV per FEBRABAN Anexos IX/X
- Subpath export `br-validators/boleto`
- `apps/cli` — `br-validators boleto validate|detect|convert|format|strip`
- `apps/playground` — `/boleto` route with detect, validate, converted counterpart
- UC-007, BR-BOLETO-001…010, golden vectors (Santander + BB)

---

## [0.2.0-rc.0] - 2026-06-21

PIX key validator across library, CLI, and playground.

### Added

- `packages/br-validators` — PIX key validation for 5 Bacen types (CPF, CNPJ, email, phone, EVP)
- `detectPixKeyType` + `validatePixKey` with optional strict `--type`
- CPF/CNPJ keys delegate to existing validators
- Subpath export `br-validators/pix`
- `apps/cli` — `br-validators pix validate|detect` with `--json`, `--quiet`, `--source`, `--type`
- `apps/playground` — client-side tester at `/pix`

### Security

- Core validates format only — no DICT lookup in core

---

## [0.2.0-beta.0] - 2026-06-21

PIS/PASEP validator across library, CLI, and playground.

### Added

- `packages/br-validators` — PIS/PASEP modulo 11 validation (golden `10027230888`)
- Subpath export `br-validators/pis-pasep`
- `apps/cli` — `br-validators pis-pasep validate|format|strip` with `--json`, `--quiet`, `--source`
- `apps/playground` — client-side tester at `/pis`

### Security

- Core validates check digit only — no CNIS lookup in core

---

## [0.2.0-alpha.0] - 2026-06-21

Placa validator across library, CLI, and playground.

### Added

- `packages/br-validators` — license plate validation (legacy `LLLNNNN` + Mercosul `LLLNLNN`)
- `convertPlacaToMercosul` — CONTRAN legacy→Mercosul mapping (golden `ABC1234` → `ABC1C34`)
- Subpath export `br-validators/placa`
- `apps/cli` — `br-validators placa validate|format|strip|convert` with `--json`, `--quiet`, `--source`
- `apps/playground` — client-side tester at `/placa`

### Security

- Core validates format only — no Detran lookup in core

---

## [0.1.0-beta.1] - 2026-06-21

CEP validator across library, CLI, and playground.

### Added

- `packages/br-validators` — CEP structural validation (golden vectors `01310100`, `20040020`)
- Subpath export `br-validators/cep`
- `apps/cli` — `br-validators cep validate|format|strip` with `--json`, `--quiet`, `--source`
- `apps/playground` — client-side tester at `/cep`

### Security

- Core validates format only — no Correios HTTP lookup in core (see adapters roadmap)

---

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
| [0.1.0-beta.1](https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-beta.1) | 2026-06-21 | CEP library + CLI + playground |
| [0.1.0-beta.0](https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-beta.0) | 2026-06-21 | CPF library + CLI + playground |
| [0.1.0-alpha.1](https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-alpha.1) | 2026-06-21 | CNPJ library + CLI + playground |
| [0.1.0-alpha.0](https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-alpha.0) | 2026-06-21 | Docs + harness bootstrap |

See [docs/VERSIONING.md](docs/VERSIONING.md) for versioning rules.

[Unreleased]: https://github.com/AlexandreZanata/doc-raiz/compare/v0.1.0-beta.1...HEAD
[0.1.0-beta.1]: https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-beta.1
[0.1.0-beta.0]: https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-beta.0
[0.1.0-alpha.1]: https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-alpha.1
[0.1.0-alpha.0]: https://github.com/AlexandreZanata/doc-raiz/releases/tag/v0.1.0-alpha.0
