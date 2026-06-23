# Adapter RFC — `@br-validators/adapters-transparencia`

> **Status:** RFC (not implemented in core)  
> **Core embed:** `@br-validators/core/transparencia-snapshots` — endpoint registry only

---

## Scope

| Domain | Delivery |
|--------|----------|
| CEIS / CNEP / CEAF / PEP | Query adapter — requires API key |
| Bolsa Família / BPC / Auxílio Emergencial | Query adapter — CPF/NIS keyed |
| Bulk sanctions / PEP snapshots | Out of scope v1 — no suitable open bulk export |

---

## Authentication

| Item | Value |
|------|-------|
| Header | Confirm in Swagger (`chave-api-dados` or current name) |
| Storage | GitHub Actions secret `TRANSPARENCIA_API_KEY` |
| Local dev | `.env.local` (gitignored) |

---

## Requirements

1. Normalize CPF/CNPJ with `@br-validators/core/cpf` / `@br-validators/core/cnpj` before query.
2. Never call Transparência API from `@br-validators/core` runtime code.
3. Rate-limit client-side; respect CGU fair-use policy.
4. Mask CPF in logs and error messages (show last 2 digits only).
5. Human confirmation before persisting query results in agentic workflows.

---

**Updated:** 2026-06-23
