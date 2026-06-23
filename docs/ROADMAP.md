# Roadmap — BR Validators

> Phased delivery. Each module ships in **library + CLI + playground** (see [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md)).
> **TypeScript first** — [TECH-STACK.md](TECH-STACK.md).
> **npm:** `@br-validators/core` + `@br-validators/cli` + `@br-validators/zod` + `@br-validators/react-hook-form` · **Current:** `v1.1.0` (reference data expanding — see Phase 11)

---

## Phase 0 — Foundation ✅

- [x] Project documentation (`docs/`)
- [x] Official sources catalog
- [x] Architecture, **TECH-STACK**, **DELIVERY-SURFACES**
- [x] MIT license + governance
- [x] **Monorepo scaffold** — `packages/br-validators`, `apps/cli`, `apps/playground`
- [x] pnpm workspaces + CI (GitHub Actions)
- [x] Vercel project → `apps/playground` ([doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app/))

---

## Phase 1 — CNPJ (v0.1.0-alpha) ✅

| Deliverable | CNPJ |
|-------------|------|
| Library | `validateCnpj`, `formatCnpj`, `stripCnpj` — numeric + alphanumeric |
| CLI | `br-validators cnpj validate\|format\|strip` + `--json` |
| Playground | `/cnpj` |
| Source | [RFB CNPJ alfanumérico PDF](OFFICIAL-SOURCES.md) |

**Release criteria:** Golden vector `12ABC34501DE35`; all three surfaces live.

---

## Phase 1b — CPF + CEP (v0.1.0-beta) ✅

| Module | Library | CLI | Playground | Source |
|--------|---------|-----|------------|--------|
| **CPF** | ✓ | ✓ | `/cpf` | RFB |
| **CEP** | ✓ | ✓ | `/cep` | Correios |

---

## Phase 2 — Enterprise fields (v0.2.0) ✅

| Module | Library | CLI | Playground | Source |
|--------|---------|-----|------------|--------|
| **Placa** | ✓ | ✓ | `/placa` | CONTRAN 729/2018 |
| **PIX key** | ✓ | ✓ | `/pix` | Bacen DICT |
| **Cartão (Luhn)** | ✓ | ✓ | `/cartao` | ISO 7812 |

---

## Phase 3 — Financial (v0.3.0) — partial ✅

| Module | Library | CLI | Playground | Status |
|--------|---------|-----|------------|--------|
| **Boleto cobrança** | ✓ | ✓ | `/boleto` | Situação 1 + 2 shipped |
| **BR Code** | ✓ `@br-validators/core/brcode` | ✓ `brcode …` | ✓ `/brcode` | Shipped — [Bacen Manual BR Code](OFFICIAL-SOURCES.md) |
| **Boleto arrecadação** | ✓ | via `boleto` | via `boleto` | Shipped — [FEBRABAN Layout v7](OFFICIAL-SOURCES.md) |

---

## Phase 4 — Extended tax IDs (v0.10.0-alpha) ✅

| Module | Library | CLI | Playground | Status |
|--------|---------|-----|------------|--------|
| **PIS/PASEP** | ✓ | ✓ | `/pis` | Shipped |
| **IE (27 UFs)** | ✓ | ✓ | `/ie` | All states shipped |
| **Alphanumeric CPF** | Blocked | — | — | RFB spec TBD |

---

## v1.0.0 ✅

| Module / requirement | Library | CLI | Playground | Status |
|----------------------|---------|-----|------------|--------|
| **18 validators** | ✓ | ✓ | ✓ | Shipped — [OFFICIAL-SOURCES](OFFICIAL-SOURCES.md) |
| **Platform APIs** | ✓ | partial | partial | `detect`, `sanitize`, `mask`, `compare`, `batch`, `diff`, `generate` (17 types) |
| **Integrations** | `@br-validators/zod`, `@br-validators/react-hook-form` | — | — | Shipped |
| **API freeze** | — | — | — | ✅ [VERSIONING.md](VERSIONING.md#api-freeze-100) |

**Deferred to post-v1.0:**

- Alphanumeric CPF (when RFB publishes spec)
- IE SP rural `P…` format — shipped in `validateIeProdutorRural`
- `@br-validators/adapters-correios` — CEP HTTP lookup (F-06)
- `@br-validators/react` — masked input hooks (F-07)
- Playwright E2E for playground

---

## Phase 10 — Integrations (v0.11.0-alpha) — partial ✅

| Module | Package | Status |
|--------|---------|--------|
| **Zod schemas (F-04)** | `@br-validators/zod` | Shipped + npm publish in release.yml |
| **React Hook Form (F-05)** | `@br-validators/react-hook-form` | Shipped + npm publish in release.yml |
| CEP HTTP lookup (F-06) | — | Backlog |
| React masked inputs (F-07) | — | Backlog |
| PHP port (F-08) | — | Backlog |

---

## Language ports (post v1.0)

| Order | Language | Package | When |
|-------|----------|---------|------|
| 1 | **TypeScript** | `@br-validators/core` | Phases 0–4 |
| 2 | PHP | Composer | After TS v1.0 if demand |
| 3 | Python | PyPI | If demand |

---

## External events

| Event | Action |
|-------|--------|
| RFB excluded CNPJ letters list published | Patch library + CLI + playground |
| RFB alphanumeric CPF spec | New module — all three surfaces |
| SEFAZ algorithm change | Patch ≤ 48h per [SECURITY.md](../SECURITY.md) |

---

## Phase 11 — Static reference data (v1.1.0+) — partial ✅

Offline government datasets — tree-shakeable subpaths, `*_DATA_VERSION` metadata, weekly refresh bot. Master plan: `.local/phases/23-static-public-data/`.

| ID | Module | Subpath | Version | Status |
|----|--------|---------|---------|--------|
| S-01 | IBGE localities | `@br-validators/core/ibge` | v1.1.0 | ✅ Shipped |
| S-02 | Bacen STR banks | `@br-validators/core/bancos` | v1.1.0 | ✅ Shipped |
| S-03 | DDD geographic lookup | `@br-validators/core/telefone` (`getDddInfo`) | v1.1.0 | ✅ Shipped |
| S-04 | National holidays | `@br-validators/core/feriados` | v1.3.0 | ✅ Released |
| S-05 | CNAE / CFOP / NCM / CBO | `@br-validators/core/{cnaes,cfop,ncm,cbo}` | v1.3.0 | ✅ Released |
| S-10 | Data transparency | `@br-validators/core/data-catalog` + weekly bot | v1.1.0 | ✅ Shipped |
| S-06 | CEP prefix ranges | `@br-validators/core/cep` (`getCepFaixaInfo`) | v1.3.0 | ✅ Released |
| S-07 / S-08 | Airports / TSE codes | `@br-validators/core/{aeroportos,tse-municipios}` (planned) | 1.4.0 | ⏸ Backlog — [25-deferred-revival](../.local/phases/25-deferred-revival/) · [24c decision log](../.local/phases/24c-deferred-datasets/) |
| S-09 | ISS rates by municipality | — | — | 🚫 Rejected — stale-data risk |

**Optional surfaces (CLI + Playground):** `.local/phases/24-reference-data-surfaces/` — `bancos lookup`, `/data/ibge`, `/data/bancos`

**Docs:** [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md) · [DATA-FRESHNESS.md](DATA-FRESHNESS.md) · [LIBRARY-API.md](LIBRARY-API.md#core-api--data-catalog-transparency)
