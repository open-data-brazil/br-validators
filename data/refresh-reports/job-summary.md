### Data refresh report

- Run date: 2026-11-23
- Datasets checked: 30
- Datasets changed: 5
- Baselines sealed this run: 0
- Source alerts: 5
- Critical alerts: 5

### ⚠️ Critical — consultation link deprecated

See `data/refresh-reports/CRITICAL-ALERTS.md` for maintainer actions.

### Source health alerts

- **nbs** (critical): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-11-20 retained in the API. (embedded data from 2026-11-20 retained)
- **cbo** (critical): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 2 attempts (interval 120000ms) — embedded data from 2026-11-20 retained in the API. (embedded data from 2026-11-20 retained)
- **portos** (critical): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-11-16 retained in the API. (embedded data from 2026-11-16 retained)
- **anp-combustiveis** (critical): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 2 attempts (interval 120000ms) — embedded data from 2026-11-20 retained in the API. (embedded data from 2026-11-20 retained)
- **feriados** (critical): Possible link deprecation (Endpoint probe failed for 1 operational URL(s) — source may be deprecated or moved.). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-06-23 retained in the API. (embedded data from 2026-06-23 retained)

See `docs/DATA-SOURCE-MAINTENANCE.md` for remediation steps.

### Dataset drift

Totals: +209 −0 ~4

| Dataset | Δ | Fields |
|---------|---|--------|
| ibge | +0 −0 ~1 | nome |
| bancos | +1 −0 ~0 | — |
| iss-municipal | +0 −0 ~1 | — |
| telefone-ddd | +0 −0 ~2 | municipios |
| esocial | +208 −0 ~0 | — |
