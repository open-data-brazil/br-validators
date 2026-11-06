# RG good first issues — remaining 21 UFs

::: info Canonical document
Mirrors [docs/community/RG-GOOD-FIRST-ISSUES.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/community/RG-GOOD-FIRST-ISSUES.md).
:::

Phase 1 shipped **SP, RJ, MG, PR, RS, SC**. The remaining **21 UFs** need community contributors.

## How to contribute

1. Pick an unclaimed UF from the table below.
2. Open an issue using the [RG UF contribution template](https://github.com/AlexandreZanata/br-validators/issues/new?template=rg-uf-contribution.md).
3. Cite the state SSP/IGP official source and add golden vectors.
4. Target **100% coverage** on new `src/core/rg/<uf>.ts` files.

| UF | Status | Suggested starting point |
|----|--------|--------------------------|
| AC | 🟢 Good first issue | SEFAZ-AC / state SSP |
| AL | 🟢 Good first issue | SEFAZ-AL [DV calculator](https://www.sefaz.al.gov.br/calculo) |
| AM | 🟢 Good first issue | SEFAZ-AM |
| AP | 🟢 Good first issue | SEFAZ-AP |
| BA | 🟢 Good first issue | SEFAZ-BA [DV calculator](https://www.sefaz.ba.gov.br/inspetoria-eletronica/icms/cadastro/calculo-dv/) |
| CE | 🟢 Good first issue | SEFAZ-CE |
| DF | 🟢 Good first issue | Receita DF |
| ES | 🟢 Good first issue | SEFAZ-ES |
| GO | 🟢 Good first issue | SEFAZ-GO |
| MA | 🟢 Good first issue | SEFAZ-MA |
| MS | 🟢 Good first issue | SEFAZ-MS |
| MT | 🟢 Good first issue | SEFAZ-MT |
| PA | 🟢 Good first issue | SEFA-PA |
| PB | 🟢 Good first issue | Receita PB |
| PE | 🟢 Good first issue | SEFAZ-PE |
| PI | 🟢 Good first issue | SEFAZ-PI |
| RN | 🟢 Good first issue | SEFAZ-RN |
| RO | 🟢 Good first issue | SEFAZ-RO |
| RR | 🟢 Good first issue | SEFAZ-RR |
| SE | 🟢 Good first issue | SEFAZ-SE |
| TO | 🟢 Good first issue | SEFAZ-TO |

**Note:** RG is never auto-detected — `uf` is always required at the API boundary.
