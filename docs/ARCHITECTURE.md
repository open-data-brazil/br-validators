# Architecture — BR Validators

> **TypeScript monorepo:** library + CLI + Vercel playground share one core.
> See [TECH-STACK.md](TECH-STACK.md) and [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md).

---

## Monorepo layout

```
br-validators/
├── packages/
│   └── br-validators/              # npm — MIT, zero runtime deps
│       ├── src/
│       │   ├── core/               # pure validation (official algorithms)
│       │   │   ├── cnpj/
│       │   │   ├── cpf.ts
│       │   │   ├── cep.ts
│       │   │   ├── placa.ts
│       │   │   ├── chave-pix.ts
│       │   │   ├── boleto.ts
│       │   │   └── ie/
│       │   ├── strip/
│       │   ├── format/
│       │   ├── types/
│       │   │   ├── validation-result.ts
│       │   │   └── brands.ts       # Cpf, Cnpj, …
│       │   └── index.ts
│       └── tests/vectors/
├── apps/
│   ├── cli/                        # br-validators bin — all doc types
│   │   └── src/commands/
│   │       ├── cnpj.ts
│   │       ├── cpf.ts
│   │       └── ...
│   └── playground/                 # Next.js → Vercel
│       ├── app/
│       │   ├── page.tsx            # landing
│       │   └── [type]/page.tsx     # per-doc tester
│       └── components/
│           └── validator-panel.tsx # strip / validate / format UI
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Dependency graph

```
apps/playground ──► packages/br-validators
apps/cli        ──► packages/br-validators

packages/br-validators ──► (no runtime dependencies)
```

Algorithms exist **once** in `packages/br-validators`. CLI and playground are thin wrappers.

---

## Layers (library)

| Layer | Responsibility | Depends on |
|-------|----------------|------------|
| **core** | Check-digit algorithms, regex, invariants | Nothing (pure) |
| **strip** | Remove masks, uppercase normalize, trim | Nothing |
| **format** | Apply official masks after validation | core, strip |
| **types** | `ValidationResult`, branded types | Nothing |
| **adapters** (future package) | Correios CEP HTTP | core |

No network, filesystem, or env vars inside `core/`, `strip/`, or `format/`.

---

## Module pattern (TypeScript)

Each identifier follows the same shape:

```typescript
// core/cnpj/index.ts
export function isValidCnpj(input: string): boolean;
export function validateCnpj(input: string): ValidationResult<Cnpj>;

// strip/cnpj.ts
export function stripCnpj(input: string): string;

// format/cnpj.ts
export function formatCnpj(input: string): FormatResult;
```

### Branded types

```typescript
export type Cnpj = string & { readonly __brand: 'Cnpj' };
export type Cpf = string & { readonly __brand: 'Cpf' };

// Only validate*() returns branded types — raw strings cannot impersonate validated docs
```

### Decorator flow

```
raw input → strip → validate → format → output
```

**Never** mask before validate. **Never** coerce invalid input.

---

## CLI architecture

```
apps/cli/src/
├── index.ts              # bin entry
├── program.ts            # Commander setup
└── commands/
    ├── list.ts
    └── cnpj/
        ├── validate.ts
        ├── format.ts
        └── strip.ts
```

Each command imports from `br-validators` — no duplicated logic.

Unified interface per type: `validate | format | strip` + `--json | --quiet | --source`.

---

## Playground architecture (Vercel)

```
apps/playground/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # type selector
│   └── cnpj/page.tsx            # one route per doc type
└── components/
    └── validator-panel.tsx      # reusable for all types
```

- **Client components** call `br-validators` in browser (bundle from workspace)
- **No server-side validation API** — PII stays in browser (LGPD-friendly)
- Official source link from config map keyed by doc type

Vercel: root `apps/playground`, build command runs `pnpm build` with workspace dependency.

---

## CNPJ module (special case)

| Function | Purpose |
|----------|---------|
| `detectCnpjFormat(input)` | `'numeric' \| 'alphanumeric' \| 'unknown'` |
| `isValidCnpjNumeric(input)` | Legacy 14-digit modulo 11 |
| `isValidCnpjAlphanumeric(input)` | ASCII-48 + RFB Q14 weights |
| `isValidCnpj(input)` | Union — default entry |

Constants in `core/cnpj/constants.ts` — weights from [RFB PDF Q14](OFFICIAL-SOURCES.md).

---

## Error model

```typescript
type ValidationResult<T extends string = string> =
  | { ok: true; value: T; format?: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string };
```

Public API: [LIBRARY-API.md](LIBRARY-API.md).

---

## Testing strategy

| Target | Tool | Coverage |
|--------|------|----------|
| Library `core/` | Vitest + golden vectors | ≥ 90% |
| CLI | Vitest integration — spawn bin, check exit codes | Key commands |
| Playground | Playwright (optional) — smoke each route | Critical paths |

Golden vectors: `tests/vectors/*.official.json` — cite URL in each file.

---

## Tree-shaking (npm)

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./cnpj": "./dist/cnpj.js",
    "./cpf": "./dist/cpf.js"
  }
}
```

---

## Technology (confirmed)

| Decision | Choice |
|----------|--------|
| Language | **TypeScript ≥ 5** |
| Monorepo | **pnpm workspaces** |
| Library build | **tsup** (ESM + CJS) |
| Tests | **Vitest** |
| CLI | **Commander** |
| Playground | **Next.js 15** on **Vercel** |
| First port (later) | PHP — not simultaneous |

Full rationale: [TECH-STACK.md](TECH-STACK.md).

---

## Per-module shipping checklist

When adding any document type:

- [ ] `packages/br-validators/src/core/<type>/`
- [ ] Golden vectors + official source row
- [ ] `apps/cli/src/commands/<type>/`
- [ ] `apps/playground/app/<type>/page.tsx`
- [ ] [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md) matrix updated
