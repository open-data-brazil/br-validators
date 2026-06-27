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
- `txt-export.ts` — `formatTxtSection()`, `formatTxtBundle()`, `downloadTextFile()` for UTF-8 `.txt` exports
- `ExportToolbar` molecule — download / copy actions on the data explorer
- `dataset-registry.gaps.md` — catalog IDs using alternative loaders (no blocking gaps)

Used by the `/data/explorer` unified search hub (Phase 36b) with TXT export (Phase 36c).

## Deploy (Vercel)

- Root directory: `apps/playground`
- Build: `pnpm build` (from monorepo root with workspace deps)
- Live URL: https://doc-raiz-playground.vercel.app/

Official source links shown per document type.
