# Backlog — BR Validators

> **Tracked index** for planned work. Detailed agent checklists live in `.local/phases/` (local only).  
> **Shipped history:** [CHANGELOG.md](../CHANGELOG.md) · **Phase overview:** [ROADMAP.md](ROADMAP.md)

---

## Current product scope (v1.5.0)

| Category | Count | Notes |
|----------|-------|-------|
| Document validators | 18 | CPF through IE produtor rural |
| Embedded reference datasets | 17 | IBGE, Bacen, ANAC, ANTAQ, fiscal, trade, logistics |
| npm packages | 4 | core, cli, zod, react-hook-form |

---

## Phase 27 — Product closure (target v1.6.0)

| ID | Task | Priority | Surfaces |
|----|------|----------|----------|
| P-01 | CLI: `compare`, `batch`, `diff` | P0 | CLI |
| P-02 | Processo judicial CNJ (mod 97-10) | P0 | library + CLI + playground |
| P-05 | Playground `/generate` — all 17 generatable types | P1 | playground |
| P-04 | Reference data gaps: CNAE, CFOP, NCM, CBO, feriados, TSE, IBGE | P1 | CLI + playground |
| P-03 | RG — SP, RJ, MG, RS, PR, SC first | P1 | library + CLI + playground |

### P-01 — Platform CLI parity

- `br-validators compare <type> <a> <b> --json`
- `br-validators batch <type> [--file path]` — stdin, summary counts
- `br-validators diff <type> <a> <b> --json`
- Update README Platform APIs table (CLI column)

### P-02 — Processo judicial CNJ

- Subpath: `@br-validators/core/processo-judicial`
- Format: `NNNNNNN-DD.AAAA.J.TT.OOOO`
- Source: CNJ Resolução 65/2008 — modulo 97-10
- Parse segments: sequencial, DV, ano, segmento, tribunal, origem

### P-05 — Generate playground parity

Core + CLI already support 17 `GeneratableDocumentType` values. Playground document workspaces now cover all of them, including `boleto-arrecadacao` and IE produtor rural (`ie-produtor-rural` route); validate/format/strip/sanitize/generate tabs follow `DocumentCapabilities` per slug. (Format tab stays disabled for `boleto-arrecadacao` — core has no arrecadação formatter.)

### P-04 — Reference surface gaps

| Dataset | Core | CLI today | Playground today |
|---------|------|-----------|------------------|
| CNAE / CFOP / NCM / CBO | ✓ | — | — |
| Feriados | ✓ | — | — |
| TSE ↔ IBGE | ✓ | — | — |
| IBGE browse | ✓ | — | partial |

### P-03 — RG identidade

- `validateRg(raw, { uf })` — UF required (no federal algorithm)
- Phase 1: six most populous states
- Community contributions for remaining 21 UFs

---

## Phase 28 — Framework adapters

| ID | Package | When |
|----|---------|------|
| F-09 | `@br-validators/express` — `brValidate({ body: { cpf: 'cpf' } })` | After v1.6 |
| F-10 | `@br-validators/vue` — `useCpf()`, `useCnpj()` composables | After F-09 or demand |

---

## Phase 29 — Community & distribution

- Documentation site (VitePress / Starlight)
- Dev.to article (English)
- GitHub good-first-issues for RG UFs
- GitHub Sponsors
- Playwright E2E smoke tests for playground

---

## Phase 30 — PHP port (deferred)

Packagist `br-validators/core` — port algorithms from TS golden vectors. Start on ERP/autopeças demand only.

---

## Explicitly not doing now

| Item | Why |
|------|-----|
| Runtime HTTP in core | Breaks offline guarantee → `@br-validators/adapters-*` |
| International validators | Dilutes Brazil-first focus |
| Dataset admin UI | Weekly bot + `data-catalog` sufficient |
| Alphanumeric CPF | Blocked until RFB publishes spec |

---

## Suggested execution order

```
Week 1: P-01 → P-05 → P-02     (v1.6.0)
Week 2: P-04 → P-03             (v1.6.x / v1.7.0)
Month 2: F-09, F-10, Phase 29
Month 3+: Phase 30 on demand
```

---

**Updated:** 2026-06-23
