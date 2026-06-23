# Data fetch scripts

> Dev/CI only — **not published** to npm.

## Commands

```bash
pnpm fetch:data:ibge      # IBGE estados + municípios → packages/br-validators/src/ibge/data/
pnpm fetch:data:bancos    # Bacen STR participants → packages/br-validators/src/bancos/data/
pnpm fetch:data:ddd       # Anatel DDD lookup → packages/br-validators/src/core/telefone/data/
pnpm fetch:data:cnaes     # IBGE CNAE subclasses → packages/br-validators/src/cnaes/data/
pnpm fetch:data:cfop      # CONFAZ CFOP table → packages/br-validators/src/cfop/data/
pnpm fetch:data:ncm       # Siscomex NCM JSON → packages/br-validators/src/ncm/data/
pnpm fetch:data:cbo       # MTE CBO occupations → packages/br-validators/src/cbo/data/
pnpm fetch:data:cep-faixas # IBGE CNEFE CEP prefixes → packages/br-validators/src/core/cep/data/ (heavy ~4GB download)
pnpm fetch:data           # All lightweight fetchers above (excludes cep-faixas)
pnpm data:refresh         # All datasets + diff report + docs/DATA-FRESHNESS.md
pnpm data:refresh:report  # Regenerate reports from committed JSON (no fetch)
```

## Policy

- Fetch only from official `.gov.br` domains
- **3 retries**, **2 s** apart per HTTP request (`scripts/lib/fetch-utils.ts`)
- On source failure: **retain** embedded JSON; write alert to `data/refresh-reports/fetch-outcomes/`
- Commit generated JSON with readable 2-space indent
- Weekly automation: `.github/workflows/data-refresh-bot.yml`
- Maintainer guide when sources break: [docs/DATA-SOURCE-MAINTENANCE.md](../docs/DATA-SOURCE-MAINTENANCE.md)
