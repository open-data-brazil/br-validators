# Roadmap — BR Validators

> Phased delivery. Each module ships in **library + CLI + playground** (see [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md)).
> **TypeScript first** — [TECH-STACK.md](TECH-STACK.md).

---

## Phase 0 — Foundation

- [x] Project documentation (`docs/`)
- [x] Official sources catalog
- [x] Architecture, **TECH-STACK**, **DELIVERY-SURFACES**
- [x] MIT license + governance
- [ ] **Monorepo scaffold** — `packages/br-validators`, `apps/cli`, `apps/playground`
- [ ] pnpm workspaces + CI
- [ ] Vercel project → `apps/playground`

---

## Phase 1 — CNPJ (v0.1.0-alpha)

**Target:** Before SEFAZ homologation peak (Q2 2026)

| Deliverable | CNPJ |
|-------------|------|
| Library | `validateCnpj`, `formatCnpj`, `stripCnpj` — numeric + alphanumeric |
| CLI | `br-validators cnpj validate\|format\|strip` + `--json` |
| Playground | `/cnpj` on Vercel |
| Source | [RFB CNPJ alfanumérico PDF](OFFICIAL-SOURCES.md) |

**Release criteria:** Golden vector `12ABC34501DE35`; all three surfaces live.

---

## Phase 1b — CPF + CEP (v0.1.0-beta)

| Module | Library | CLI | Playground | Source |
|--------|---------|-----|------------|--------|
| **CPF** | ✓ | ✓ | `/cpf` | RFB |
| **CEP** | ✓ | ✓ | `/cep` | Correios |

Shared: strip/format pipeline, branded types `Cpf`, `Cep`.

---

## Phase 2 — Enterprise fields (v0.2.0)

| Module | Library | CLI | Playground | Source |
|--------|---------|-----|------------|--------|
| **Placa** | ✓ | ✓ | `/placa` | CONTRAN 729/2018 |
| **PIX key** | ✓ | ✓ | `/pix` | 0.2.0-rc.0 |
| **Cartão (Luhn)** | ✓ | ✓ | `/cartao` | 0.3.0-alpha.0 · ISO 7812 |

---

## Phase 3 — Financial (v0.3.0)

| Module | Library | CLI | Playground | Source |
|--------|---------|-----|------------|--------|
| **Boleto** | ✓ | ✓ | `/boleto` | FEBRABAN |
| **BR Code** | ✓ | ✓ | `/brcode` | Bacen Manual BR Code |

---

## Phase 4 — Extended tax IDs (v1.0.0)

| Module | Library | CLI | Playground | Source |
|--------|---------|-----|------------|--------|
| **PIS/PASEP** | ✓ | ✓ | `/pis` | 0.2.0-beta.0 |
| **IE (per state)** | ✓ | ✓ | `/ie` | SEFAZ |
| **Alphanumeric CPF** | Blocked | — | — | RFB spec TBD |

---

## Language ports (post v1.0 — not parallel)

| Order | Language | Package | When |
|-------|----------|---------|------|
| 1 | **TypeScript** | npm `br-validators` | Phases 0–4 |
| 2 | PHP | Composer | After TS v1.0 if demand (legacy autopeças/lojista) |
| 3 | Python | PyPI | If demand |

Ports use TS golden vectors as spec — no reimplementation from scratch.

---

## Marketing milestones

| Milestone | Surfaces |
|-----------|----------|
| Alpha CNPJ alphanumeric | npm + CLI + Vercel `/cnpj` |
| Beta CPF/CEP | Playground tabs + CLI commands |
| v0.2.0 | Full enterprise kit — placa + PIX |
| v1.0.0 | Stable SemVer + security audit |

---

## Backlog

- `@br-validators/react` — masked input hooks (OSS)
- `@br-validators/adapters-correios` — CEP HTTP (OSS)
- pt-BR error messages (optional i18n pack)
- Playwright E2E for playground

---

## External events

| Event | Action |
|-------|--------|
| RFB excluded CNPJ letters list published | Patch library + CLI + playground source text |
| RFB alphanumeric CPF spec | New module — all three surfaces |
| SEFAZ algorithm change | Patch ≤ 48h per [SECURITY.md](../SECURITY.md) |
