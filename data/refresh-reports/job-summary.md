### Data refresh report

- Run date: 2026-08-11
- Datasets checked: 30
- Datasets changed: 2
- Baselines sealed this run: 0
- Source alerts: 13
- Critical alerts: 0

### Source health alerts

- **ibge** (warning): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **bancos** (warning): Possible link deprecation (HTTP 502 fetching https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **moedas** (warning): Possible link deprecation (HTTP 502 fetching https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **ptax** (warning): Possible link deprecation (HTTP 502 fetching https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='AUD'&@dataInicial='04-08-2026'&@dataFinalCotacao='08-11-2026'&$format=json). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **selic** (warning): Possible link deprecation (HTTP 502 fetching https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=14/05/2026&dataFinal=11/08/2026). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **cnaes** (warning): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **nbs** (warning): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **ncm** (warning): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **cbo** (warning): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **portos** (warning): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **anp-combustiveis** (warning): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **pncp-reference** (warning): Source blocked or unreachable from CI network — not link deprecation (fetch failed). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-08-05 retained in the API. (embedded data from 2026-08-05 retained)
- **feriados** (warning): Possible link deprecation (Endpoint probe failed for 1 operational URL(s) — source may be deprecated or moved.). No new data after 5 attempts (interval 120000ms) — embedded data from 2026-06-23 retained in the API. (embedded data from 2026-06-23 retained)

See `docs/DATA-SOURCE-MAINTENANCE.md` for remediation steps.

### Dataset drift

Totals: +608 −0 ~0

| Dataset | Δ | Fields |
|---------|---|--------|
| iss-municipal | +400 −0 ~0 | — |
| esocial | +208 −0 ~0 | — |
