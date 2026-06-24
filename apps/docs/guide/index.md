# Introduction

**BR Validators** is a TypeScript monorepo for validating and formatting Brazilian document identifiers and looking up embedded federal/state reference datasets — without calling third-party APIs at runtime.

| Surface | Package |
|---------|---------|
| Core library | `@br-validators/core` |
| CLI | `@br-validators/cli` |
| Zod schemas | `@br-validators/zod` |
| React Hook Form | `@br-validators/react-hook-form` |
| Express / Fastify | `@br-validators/express` |
| Vue 3 | `@br-validators/vue` |

The root [README](https://github.com/AlexandreZanata/br-validators#readme) stays the quick start; this site is the deep reference.

## Design principles

1. **Brazil-first** — algorithms match official primary sources ([Official sources](/reference/official-sources)).
2. **No throws on invalid input** — `validate*` returns `{ ok: false, code, message }`.
3. **100% test coverage** on `packages/br-validators/src/**` with golden vectors from government docs.
4. **Offline by default** — reference datasets ship as embedded JSON; weekly refresh bot updates them.

## Next steps

- [Install](/guide/install) — npm packages and subpath imports
- [Framework adapters](/guide/adapters) — Zod, RHF, Express, Vue
- [Library API](/api/library-api) — full function reference (synced from monorepo)
