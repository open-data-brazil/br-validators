# Playground — BR Validators

Next.js app for testing validators in the browser (100% client-side).

**Production:** https://doc-raiz-playground.vercel.app/

## Dev

```bash
pnpm install
pnpm --filter @br-validators/playground dev
```

Open http://localhost:3000/cnpj

## Reference data hub (Phase 36a)

Typed dataset registry under `lib/reference-data/` maps every `getDataCatalog()` id to dynamic `@br-validators/core/*` loaders and TXT row formatters:

- `dataset-adapter.ts` — `DatasetAdapter`, `SearchOptions`, `normalizeSearchQuery`, `clientFilterRows`, `rowToKeyValueBlock`
- `dataset-registry.ts` — 34 adapters; `getDatasetAdapter(id)`, `getAllDatasetAdapters()`
- `dataset-search.ts` — `searchDatasets()` cross-catalog orchestrator (used by `/data/explorer`)
- `txt-export.ts` — `formatTxtSection()`, `formatTxtBundle()`, `downloadTextFile()`, size hint helpers (`getUtf8ByteLength`, `formatExportByteSize`)
- `ExportToolbar` molecule — download / copy actions; shows approx. size when export > 1 MB
- `dataset-registry.gaps.md` — catalog IDs using alternative loaders (no blocking gaps)

Used by the `/data/explorer` unified search hub (Phase 36b) with TXT export (Phase 36c).

## Large datasets (Phase 36d)

- `export-limits.ts` — `PREVIEW_ROW_CAP` (100), `EXPORT_ROW_CAP` (50k), chunk size 500
- `async-export.ts` — chunked TXT body formatting with progress + cancel
- `dataset-export-rules.ts` — IBGE UF, NCM embed warn, feriados year, PTAX moeda/range, ISS UF filter
- `run-full-export.ts` — orchestrates full-dataset export from the hub
- Catalog table links to `/data/explorer?dataset=<id>`; IBGE, fiscal, and bancos explorers reuse `ExportToolbar`

## Deploy (Vercel)

- Root directory: `apps/playground`
- Build: `pnpm build` (from monorepo root with workspace deps)
- Live URL: https://doc-raiz-playground.vercel.app/

Official source links shown per document type.
