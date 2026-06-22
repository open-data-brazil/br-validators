# Technology stack — TypeScript first

> **Decision:** TypeScript is the primary and first implementation language.
> PHP and Python are **future ports** — not simultaneous development.

---

## Why TypeScript first

| Criterion | TypeScript advantage |
|-----------|---------------------|
| **Audience** | Brazilian SaaS/B2B devs overwhelmingly use Node/TS |
| **Distribution** | npm organic discovery (`cpf validator brazil`, `cnpj npm`) |
| **Runtime reach** | Pure logic compiles to JS — Node, browser, Deno, Bun, React Native, edge |
| **Zero deps** | Validation is pure functions — no runtime-specific APIs in core |
| **Typing as product** | Branded types prevent passing unvalidated strings (see below) |
| **Demo surfaces** | Web playground (Vercel) and CLI share the same TS core |
| **Solo velocity** | One codebase to test, document, and ship before porting |

---

## What we build in TypeScript

| Package / app | Role | Deploy |
|---------------|------|--------|
| `packages/br-validators` | Core library — strip, validate, format | npm |
| `apps/playground` | Clean web UI to test **all** document types | Vercel |
| `apps/cli` | Terminal tool to test **all** document types | npm bin `br-validators` |

Every validator (CPF, CNPJ, CEP, placa, PIX, boleto, …) is available in:

1. **Library API** — `import { validateCnpj } from 'br-validators/cnpj'`
2. **CLI** — `br-validators cnpj validate 12ABC34501DE35`
3. **Playground** — select type, paste value, see strip / validate / format + official source link

---

## Branded types (competitive differentiator)

Raw strings are not the same as validated documents:

```typescript
/** Canonical validated CPF — only produced by validateCpf() */
export type Cpf = string & { readonly __brand: 'Cpf' };

/** Canonical validated CNPJ — numeric or alphanumeric */
export type Cnpj = string & { readonly __brand: 'Cnpj' };

export function validateCpf(input: string): ValidationResult<Cpf>;
export function validateCnpj(input: string): ValidationResult<Cnpj>;
```

Consumers get compile-time safety: a `string` from user input cannot be passed where `Cpf` is required without going through validation.

---

## Monorepo layout

```
br-validators/
├── packages/
│   └── br-validators/          # @scope/br-validators — MIT, zero runtime deps
│       ├── src/core/           # algorithms (official sources only)
│       ├── src/strip/
│       ├── src/format/
│       ├── src/types/
│       └── tests/vectors/
├── apps/
│   ├── playground/             # Next.js (or similar) — Vercel
│   │   ├── app/
│   │   └── components/         # clean, minimal UI per doc type
│   └── cli/                    # Commander or citty — wraps br-validators
│       └── src/commands/       # one command group per doc type
├── pnpm-workspace.yaml
└── turbo.json                  # optional — build orchestration
```

---

## Toolchain (confirmed)

| Tool | Version | Purpose |
|------|---------|---------|
| **TypeScript** | ≥ 5.0 | Language |
| **pnpm** | ≥ 9 | Monorepo workspaces |
| **Vitest** | latest | Unit tests, ≥ 90% on `core/` |
| **tsup** or **unbuild** | latest | ESM + CJS bundle for library |
| **Next.js** | 15+ | Playground (App Router) |
| **Vercel** | — | Playground hosting |
| **Commander** | latest | CLI argument parsing |

Runtimes supported by compiled output: **Node 18+**, **Bun**, **Deno**, browsers (ESM).

---

## Port strategy (later — not now)

Do **not** implement TS + PHP + Python simultaneously. Sequence:

| Order | Language | Package | When |
|-------|----------|---------|------|
| 1 | **TypeScript** | `br-validators` npm | Now — validate all algorithms here |
| 2 | **PHP** | Composer package | After TS v1.0 — port tested logic (legacy autopeças/lojista BR) |
| 3 | **Python** | PyPI package | If demand — port from TS + golden vectors |

Porting is **translation**, not reimplementation: golden vectors and official-source docs from TS are the spec for other languages.

---

## Playground (Vercel) — requirements

Clean, fast demo for **every** supported document type.

### UX

- Document type selector: CPF, CNPJ, CEP, Placa, PIX, … (grows with roadmap)
- Single input field + optional “formatted input” toggle
- Results panel:
  - **Strip** — normalized value
  - **Validate** — ok / error code / message / detected format
  - **Format** — official mask (if valid)
- **Official source** link per type (from [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md))
- No data sent to server for validation — **client-side only** (privacy, LGPD-friendly)

### Tech

- Imports `br-validators` from workspace package
- Deploy: Vercel project `apps/playground`
- Env: none required for core validation

### Phase alignment

| Playground support | Library phase |
|--------------------|---------------|
| CNPJ | Phase 1 |
| CPF, CEP | Phase 1 completion |
| Placa, PIX | Phase 2 |
| Boleto | Phase 3 |

---

## CLI — requirements

Terminal access for **every** supported document type — CI scripts, quick checks, support teams.

### Install

```bash
npm install -g br-validators
# or: npx br-validators ...
# or: pnpm exec br-validators ...
```

### Command shape (consistent for all types)

```bash
br-validators <type> <action> [value] [options]

# Examples
br-validators cnpj validate 12ABC34501DE35
br-validators cnpj validate --file ./input.txt
br-validators cnpj format 12ABC34501DE35
br-validators cnpj strip "12.ABC.345/01DE-35"

br-validators cpf validate 12345678909
br-validators cep format 01310100
br-validators placa validate ABC1D23
br-validators pix validate user@email.com

br-validators list                    # all supported types
br-validators cnpj --help
```

### Output modes

| Flag | Output |
|------|--------|
| default | Human-readable (valid/invalid + formatted) |
| `--json` | Machine-readable `ValidationResult` |
| `--quiet` | Exit code only (0 = valid, 1 = invalid) — for CI |

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | Valid |
| 1 | Invalid |
| 2 | Usage error |

### Phase alignment

CLI commands ship **with** each library module — CNPJ CLI in Phase 1, CPF in Phase 1b, etc.

---

## npm package

```json
{
  "name": "br-validators",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./cnpj": "./dist/cnpj.js",
    "./cpf": "./dist/cpf.js"
  },
  "bin": {
    "br-validators": "./dist/cli.js"
  }
}
```

Optional split later: `@br-validators/cli` if bin size matters — v1 can be single package with subpath exports.

---

## Related docs

| Document | Link |
|----------|------|
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Public API | [LIBRARY-API.md](LIBRARY-API.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |
| Implementation plan | `.local/IMPLEMENTATION-PLAN.md` (gitignored) |
