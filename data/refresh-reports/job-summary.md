### Data refresh report

- Run date: 2026-11-08
- Datasets checked: 30
- Datasets changed: 2
- Baselines sealed this run: 0
- Source alerts: 3
- Critical alerts: 1

### ⚠️ Critical — consultation link deprecated

See `data/refresh-reports/CRITICAL-ALERTS.md` for maintainer actions.

### Source health alerts

- **cnaes** (critical): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 2 attempts (interval 120000ms) — embedded data from 2026-10-22 retained in the API. (embedded data from 2026-10-22 retained)
- **natureza-juridica** (warning): Official source responded but data was not parseable (HTTP 504 downloading https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Naturezas.zip). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-11-07 retained in the API. (embedded data from 2026-11-07 retained)
- **cnpj-motivos** (warning): Official source responded but data was not parseable (HTTP 504 downloading https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Motivos.zip). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-11-07 retained in the API. (embedded data from 2026-11-07 retained)

See `docs/DATA-SOURCE-MAINTENANCE.md` for remediation steps.

### Dataset drift

Totals: +208 −0 ~1

| Dataset | Δ | Fields |
|---------|---|--------|
| iss-municipal | +0 −0 ~1 | — |
| esocial | +208 −0 ~0 | — |
