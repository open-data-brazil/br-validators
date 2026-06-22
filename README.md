# doc-raiz / BR Validators

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm @br-validators/core](https://img.shields.io/npm/v/@br-validators/core)](https://www.npmjs.com/package/@br-validators/core)
[![GitHub release](https://img.shields.io/github/v/release/AlexandreZanata/doc-raiz)](https://github.com/AlexandreZanata/doc-raiz/releases)

**100% open-source** (MIT) library, CLI, and web playground for formatting and validating Brazilian document identifiers — built on official primary sources (Receita Federal, Bacen, CONTRAN, Correios, SEFAZ).

> **Note:** The unscoped npm name `br-validators` belongs to another project. This repo publishes **`@br-validators/core`** (library) and **`@br-validators/cli`** (terminal).

---

## Install (end users)

### Library

```bash
npm install @br-validators/core
# or
pnpm add @br-validators/core
```

### CLI

```bash
npm install -g @br-validators/cli
# or
npx @br-validators/cli --help
```

### Playground (no install)

Open the live demo: **[doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app/)** — client-side only, no PII sent to server.

---

## Supported document types

| Type | Library import | CLI | Playground |
|------|----------------|-----|------------|
| CNPJ (numeric + alphanumeric) | `@br-validators/core/cnpj` | `br-validators cnpj …` | `/cnpj` |
| CPF | `@br-validators/core/cpf` | `br-validators cpf …` | `/cpf` |
| CEP | `@br-validators/core/cep` | `br-validators cep …` | `/cep` |
| License plate (Mercosul + legacy) | `@br-validators/core/placa` | `br-validators placa …` | `/placa` |
| PIS / PASEP / NIS | `@br-validators/core/pis-pasep` | `br-validators pis-pasep …` | `/pis` |
| PIX key | `@br-validators/core/pix` | `br-validators pix …` | `/pix` |
| Boleto (Situação 1 + 2) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| Credit card (Luhn / ISO 7812) | `@br-validators/core/cartao-credito` | `br-validators cartao …` | `/cartao-credito` |
| Inscrição Estadual (27 UFs) | `@br-validators/core/inscricao-estadual` | `br-validators ie … --uf SP` | `/ie` |

Official sources per type: [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md)

---

## Quick examples

### Library

```typescript
import { validateCnpj, formatCnpj } from '@br-validators/core';
import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';

validateCnpj('12ABC34501DE35'); // RFB Q14 golden vector
formatCnpj('12ABC34501DE35');   // 12.ABC.345/01DE-35

validateInscricaoEstadual('110042490114', { uf: 'SP' });
```

### CLI

```bash
br-validators cnpj validate 12ABC34501DE35 --json --source
br-validators ie validate 110042490114 --uf SP --json
br-validators boleto validate 03399025790899183400671742301014614500000099668
br-validators list
```

### CI gate

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
```

---

## Develop from source

```bash
git clone https://github.com/AlexandreZanata/doc-raiz.git
cd doc-raiz
pnpm install          # builds @br-validators/core via prepare
pnpm verify           # lint + typecheck + 100% coverage + build
pnpm --filter @br-validators/playground dev   # http://localhost:3000
```

---

## Monorepo layout

```
packages/br-validators/   # @br-validators/core — npm library
apps/cli/                 # @br-validators/cli — terminal
apps/playground/          # Web UI (Vercel)
```

Every shipped type exists in **library + CLI + playground**. See [docs/DELIVERY-SURFACES.md](docs/DELIVERY-SURFACES.md).

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/LIBRARY-API.md](docs/LIBRARY-API.md) | Public API contract |
| [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md) | RFB, Bacen, CONTRAN, SEFAZ sources |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phases and backlog |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [AGENTS.md](AGENTS.md) | Entry point for coding agents |

---

## Current release

**v0.10.0-alpha.0** — pre-1.0; API may change. Pin exact version in production.

| Not in v0.10 | Reason |
|--------------|--------|
| BR Code payload parsing | Backlog — PIX **keys** shipped; BR Code QR parsing deferred |
| Boleto arrecadação (48-digit) | Detected only; validation deferred |
| Alphanumeric CPF | Blocked — RFB spec not published |
| IE SP rural `P…` | Out of scope |

---

## License

[MIT](LICENSE) — permanently free and open source. See [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md).
