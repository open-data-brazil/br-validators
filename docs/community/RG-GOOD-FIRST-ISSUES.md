# RG good first issues — remaining 21 UFs

> **Labels:** `good first issue`, `rg-uf`  
> **Template:** [.github/ISSUE_TEMPLATE/rg-uf-contribution.md](../../.github/ISSUE_TEMPLATE/rg-uf-contribution.md)  
> **Depends on:** Phase 27c RG phase 1 (SP, RJ, MG, PR, RS, SC shipped)

Phase 1 covers six states (~70% of population). The remaining **21 UFs** are ideal **good first issues** for contributors who can cite a state SSP/IGP official source.

## Shipped (do not re-open)

| UF | Algorithm | Golden vector |
|----|-----------|---------------|
| SP | Modulo 11 | `120300011` |
| RJ | Modulo 10 | `27998111` |
| MG | Modulo 10 + optional `M` | `27998111` |
| PR | Format-only (8 digits) | `12345678` |
| RS | Format-only (10 digits) | `1234567890` |
| SC | Format-only (9 digits) | `123456789` |

## Open for contribution

| UF | Issue title suggestion | Notes |
|----|------------------------|-------|
| AC | `[rg] Add RG validation for UF AC` | SEFAZ-AC / state SSP |
| AL | `[rg] Add RG validation for UF AL` | [SEFAZ-AL DV calculator](https://www.sefaz.al.gov.br/calculo) |
| AM | `[rg] Add RG validation for UF AM` | SEFAZ-AM |
| AP | `[rg] Add RG validation for UF AP` | SEFAZ-AP |
| BA | `[rg] Add RG validation for UF BA` | [SEFAZ-BA DV calculator](https://www.sefaz.ba.gov.br/inspetoria-eletronica/icms/cadastro/calculo-dv/) |
| CE | `[rg] Add RG validation for UF CE` | SEFAZ-CE |
| DF | `[rg] Add RG validation for UF DF` | Receita DF |
| ES | `[rg] Add RG validation for UF ES` | SEFAZ-ES |
| GO | `[rg] Add RG validation for UF GO` | SEFAZ-GO CCE |
| MA | `[rg] Add RG validation for UF MA` | SEFAZ-MA |
| MS | `[rg] Add RG validation for UF MS` | SEFAZ-MS |
| MT | `[rg] Add RG validation for UF MT` | SEFAZ-MT |
| PA | `[rg] Add RG validation for UF PA` | SEFA-PA |
| PB | `[rg] Add RG validation for UF PB` | Receita PB |
| PE | `[rg] Add RG validation for UF PE` | SEFAZ-PE |
| PI | `[rg] Add RG validation for UF PI` | SEFAZ-PI |
| RN | `[rg] Add RG validation for UF RN` | SEFAZ-RN |
| RO | `[rg] Add RG validation for UF RO` | SEFAZ-RO |
| RR | `[rg] Add RG validation for UF RR` | SEFAZ-RR |
| SE | `[rg] Add RG validation for UF SE` | SEFAZ-SE |
| TO | `[rg] Add RG validation for UF TO` | SEFAZ-TO |

## Maintainer checklist when merging a UF

- [ ] `packages/br-validators/tests/vectors/rg.<uf>.official.json`
- [ ] `src/core/rg/<uf>.ts` registered in `RG_SUPPORTED_UFS`
- [ ] Row in [docs/OFFICIAL-SOURCES.md § RG](../OFFICIAL-SOURCES.md#rg--reference-index)
- [ ] `pnpm --filter @br-validators/core test:coverage` — 100% on `src/**`
- [ ] CHANGELOG `[Unreleased]`

## API rule

`validateRg(raw, { uf })` **requires UF**. `detect()` does **not** auto-classify RG.
