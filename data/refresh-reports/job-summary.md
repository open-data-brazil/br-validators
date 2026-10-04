### Data refresh report

- Run date: 2026-10-04
- Datasets checked: 30
- Datasets changed: 2
- Baselines sealed this run: 0
- Source alerts: 2
- Critical alerts: 1

### ⚠️ Critical — consultation link deprecated

See `data/refresh-reports/CRITICAL-ALERTS.md` for maintainer actions.

### Source health alerts

- **selic** (critical): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-10-02 retained in the API. (embedded data from 2026-10-02 retained)
- **pncp-reference** (warning): Possible link deprecation (HTTP 502 fetching https://pncp.gov.br/api/pncp/v1/modalidades). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-10-03 retained in the API. (embedded data from 2026-10-03 retained)

See `docs/DATA-SOURCE-MAINTENANCE.md` for remediation steps.

### Dataset drift

Totals: +208 −0 ~1

| Dataset | Δ | Fields |
|---------|---|--------|
| iss-municipal | +0 −0 ~1 | — |
| esocial | +208 −0 ~0 | — |
