# Vision — BR Validators

## Mission

Build a **100% open-source**, dependency-light library that any developer can use to **format** and **validate** Brazilian document identifiers and related data — with algorithms aligned to **official primary sources**, not blog posts or Stack Overflow snippets.

Wrong check-digit logic (especially CPF/CNPJ) destroys trust in a validation library. This project treats **source traceability** and **test vectors from official examples** as first-class requirements.

## What we build

| Capability | Description |
|------------|-------------|
| **Validate** | Check structure + check digits (where applicable) per official rules |
| **Format** | Apply official masks from raw/stripped input (`00012300012` → `000.123.000-12`) |
| **Strip** | Remove masks and normalize input before validation |
| **Convert** | Where formats coexist (e.g. legacy plate ↔ Mercosul), convert between them |
| **Parse** (future) | Structured output (typed fields) for composite formats (boleto, BR Code) |

## Design principles

1. **Official sources only** — every algorithm links to a primary reference in [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).
2. **Pure functions** — no I/O in core validators; optional adapters for Correios CEP lookup live outside core.
3. **Dual-format readiness** — CNPJ numeric + alphanumeric from day one; legacy + Mercosul plates.
4. **Fail closed** — invalid input returns explicit failure; never silently “fix” data.
5. **Constants over magic** — excluded letters for alphanumeric CNPJ, weights, regex — all in one updatable place.
6. **Enterprise coverage** — prioritize identifiers every Brazilian system touches before niche fields.

## Target consumers

- Backend APIs (Node, Bun, Deno, edge workers)
- Frontend forms (browser bundle, tree-shakeable exports)
- Data pipelines and ETL
- Open-source frameworks needing BR validation without vendor lock-in
- **CLI users** — terminal validation in CI and support workflows
- **Playground visitors** — try validators without installing (Vercel)

## Delivery surfaces

Every document type ships in three forms — same TypeScript core:

| Surface | Where |
|---------|--------|
| **npm library** | `import { validateCnpj } from 'br-validators/cnpj'` |
| **CLI** | `br-validators cnpj validate 12ABC34501DE35` |
| **Playground** | Clean web UI on Vercel — client-side only |

Details: [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md)

## Technology

**TypeScript first** — npm publish, branded types, then port to PHP/Python only after v1.0.

Details: [TECH-STACK.md](TECH-STACK.md)

## Non-goals (v1)

- **Online verification** against Receita Federal / SEFAZ / Detran APIs (out of scope for core lib)
- **Alphanumeric CPF** — planned by RFB for 2026 but **no official spec published yet**; numeric only until then
- **Single algorithm for Inscrição Estadual** — 27 state-specific rules; phased delivery per [ROADMAP.md](ROADMAP.md)
- **PIS/PASEP/NIS** — included in roadmap but pending clearer primary source documentation

## Differentiator

> **First open-source library ready for alphanumeric CNPJ (RFB IN 2.229/2024)** before production rollout (July 2026).

Homologation windows for SEFAZ integrations open in **April 2026**. Supporting both numeric and alphanumeric CNPJ at launch is not a “future feature” — it is **P0**.

## License

**MIT** — confirmed. See [LICENSE](../LICENSE) and [OPEN-SOURCE.md](OPEN-SOURCE.md).

Permanently **100% open source**: no paid tier, no open core, no proprietary validators in this repository.

## Success criteria

- Every validator has unit tests with vectors from official documents or worked examples
- Public API stable and documented in [LIBRARY-API.md](LIBRARY-API.md)
- Zero false positives on known official test cases
- Bundle size and tree-shaking documented for frontend use
- **CLI** and **Vercel playground** cover every shipped document type
