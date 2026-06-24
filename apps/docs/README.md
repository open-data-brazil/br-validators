# @br-validators/docs

VitePress documentation site for BR Validators.

## Why VitePress

Matches the monorepo TypeScript toolchain (Vite + Vue 3) without adding Astro/Starlight. API tables auto-sync from `docs/LIBRARY-API.md`.

## Local dev

```bash
pnpm --filter @br-validators/docs dev
```

## Deploy

Target: Vercel subdomain `docs.br-validators.dev` (configure project root to `apps/docs`).

```bash
pnpm --filter @br-validators/docs build
```

Output: `apps/docs/.vitepress/dist`
