# Dataset registry — core API gap inventory (Phase 36a)

> Playground adapters in `lib/reference-data/dataset-registry.ts` map all 34 `getDataCatalog()` IDs.
> Items below use alternative loaders or merged shapes — no core API follow-up required unless noted.

| Catalog ID | Gap / alternative loader | Core follow-up? |
|------------|---------------------------|-----------------|
| `telefone-ddd` | No `getAll*` — `ANATEL_DDDS` + `getDddInfo()` | Optional: `getAllDddInfo()` |
| `tse-municipios` | `getMapeamentoTseIbge()` not named `getAll*` | Optional: alias export |
| `cep-faixas` | `getCepFaixas()` not named `getAll*` | Optional: alias export |
| `cnpj-motivos` | `getMotivosSituacaoCadastral()` not named `getAll*` | Optional: alias export |
| `feriados` | `getAllFeriados(year)` requires year parameter | Documented in adapter |
| `ptax` | `getPtaxHistorico(moeda, { desde, ate })` — no flat `getAll*` | Optional: `getAllPtax()` |
| `esocial` | Single catalog id — categorias + rubricas merged with `registro` | Optional: split catalog ids |
| `pncp-reference` | `getAllPncpReference(tableId)` — 8 tables merged | Optional: unified `getAllPncpReference()` |
| `simples-nacional` | Nested anexos/faixas flattened in adapter | None |
| `irpf` / `inss` | Table rows flattened per year in adapter | None |
| `anp-combustiveis` | `getAllAnpPrecosMedios()`; weeks separate | None |
| `ibpt` | Golden subset via `getAllIbptCargas()` | None (by design) |
| `transparencia-snapshots` | Endpoint metadata only — `getTransparenciaEndpoints()` | None (by design) |
| `ibge` | No core `search*` — client filter on estados + municipios | Optional: `searchIbge()` |
| `bancos` | No core `search*` — client filter | Optional: `searchBancos()` |

**No blocking gaps** — all 34 catalog IDs have working playground adapters with dynamic `@br-validators/core/*` imports.
