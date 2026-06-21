# Library public API contract

> Version all public exports from day one. Breaking changes require major version bump.
> Package name (working): `br-validators` — finalize at first npm publish.
> **Also exposed via:** CLI (`br-validators <type> …`) and Vercel playground — see [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md).

---

## Language

**TypeScript only** for v1. Implementation language and rationale: [TECH-STACK.md](TECH-STACK.md).

## Package entry points

| Import path | Exports |
|-------------|---------|
| `br-validators` | Full barrel (tree-shakeable) |
| `br-validators/cpf` | CPF only |
| `br-validators/cnpj` | CNPJ numeric + alphanumeric |
| `br-validators/cep` | CEP |
| `br-validators/placa` | License plates |
| `br-validators/pix` | PIX keys |
| `br-validators/boleto` | Boleto (future) |
| `br-validators/ie` | State registration (future, per-state) |

---

## Shared types

```typescript
/** Stripped/canonical value when validation succeeds */
type CanonicalValue = string;

type DocumentFormat = 'numeric' | 'alphanumeric' | 'legacy' | 'mercosul';

type ValidationErrorCode =
  | 'INVALID_LENGTH'
  | 'INVALID_CHARACTER'
  | 'INVALID_CHECK_DIGIT'
  | 'KNOWN_INVALID_PATTERN'
  | 'UNSUPPORTED_FORMAT'
  | 'EMPTY_INPUT';

type ValidationResult<T extends CanonicalValue = CanonicalValue> =
  | { ok: true; value: T; format?: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string };

type FormatResult =
  | { ok: true; formatted: string }
  | { ok: false; code: ValidationErrorCode; message: string };

/** Branded types — only produced by successful validate*() */
type Cpf = string & { readonly __brand: 'Cpf' };
type Cnpj = string & { readonly __brand: 'Cnpj' };
type Cep = string & { readonly __brand: 'Cep' };
type Placa = string & { readonly __brand: 'Placa' };
```

All public validators return `ValidationResult<T>` with branded `T` where applicable — **never** throw for invalid input (unless documented `assert*` helpers).

### CLI mirror

Every `validate*` / `format*` / `strip*` function maps to:

```bash
br-validators <type> validate|format|strip <value> [--json]
```

See [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md).

---

## Core API — CPF

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripCpf` | `(input: string) => string` | Remove non-digits |
| `isValidCpf` | `(input: string) => boolean` | Modulo 11, reject known invalid patterns |
| `validateCpf` | `(input: string) => ValidationResult` | Full result with canonical 11 digits |
| `formatCpf` | `(input: string) => FormatResult` | `XXX.XXX.XXX-DD` after validation |

**Invariants:** Output canonical form is exactly 11 digits. Alphanumeric CPF **not supported** until RFB publishes spec.

---

## Core API — CNPJ

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripCnpj` | `(input: string) => string` | Remove punctuation; preserve A-Z0-9 |
| `detectCnpjFormat` | `(input: string) => DocumentFormat \| 'unknown'` | Detect numeric vs alphanumeric |
| `isValidCnpjNumeric` | `(input: string) => boolean` | 14-digit modulo 11 |
| `isValidCnpjAlphanumeric` | `(input: string) => boolean` | ASCII-48 + SERPRO weights |
| `isValidCnpj` | `(input: string) => boolean` | Either format |
| `validateCnpj` | `(input: string) => ValidationResult` | Includes `format` in success branch |
| `formatCnpjNumeric` | `(input: string) => FormatResult` | `XX.XXX.XXX/XXXX-DD` |
| `formatCnpjAlphanumeric` | `(input: string) => FormatResult` | Mask TBD per RFB display rules |

**Invariants:** Canonical value length always 14. **Never parse as integer.**

---

## Core API — CEP

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripCep` | `(input: string) => string` | 8 digits only |
| `isValidCep` | `(input: string) => boolean` | Length + digits; no check digit |
| `formatCep` | `(input: string) => FormatResult` | `XXXXX-XXX` |

---

## Core API — License plate (Placa)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `detectPlacaFormat` | `(input: string) => 'legacy' \| 'mercosul' \| 'unknown'` | |
| `isValidPlacaLegacy` | `(input: string) => boolean` | `LLLNNNN` |
| `isValidPlacaMercosul` | `(input: string) => boolean` | `LLLNLNN` |
| `isValidPlaca` | `(input: string) => boolean` | Either format |
| `convertPlacaToMercosul` | `(input: string) => FormatResult` | Legacy → Mercosul where mappable |
| `formatPlaca` | `(input: string) => FormatResult` | Uppercase, no hyphen |

---

## Core API — PIX key

| Function | Signature | Behavior |
|----------|-----------|----------|
| `detectPixKeyType` | `(input: string) => PixKeyType \| 'unknown'` | |
| `isValidPixKey` | `(input: string) => boolean` | Delegates by type |
| `validatePixKey` | `(input: string) => ValidationResult` | |

```typescript
type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';
```

Phone keys: E.164 with `+55` per Bacen rules. EVP: UUID v4 format.

---

## Core API — Boleto (future)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `validateLinhaDigitavel` | `(input: string) => ValidationResult` | Modulo 10 |
| `validateCodigoBarras` | `(input: string) => ValidationResult` | 44 digits |
| `convertLinhaToCodigoBarras` | `(input: string) => ValidationResult` | |

---

## Core API — Credit card (Luhn)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `isValidLuhn` | `(input: string) => boolean` | ISO/IEC 7812 |
| `detectCardBrand` | `(input: string) => string \| null` | Best-effort, non-authoritative |

---

## Format pipeline (convenience)

High-level helper used by UI formatters:

```typescript
function formatDocument(
  type: 'cpf' | 'cnpj' | 'cep' | 'placa',
  input: string
): FormatResult;
```

Implementation: `strip → validate → apply mask`. See [use-cases/UC-003-format-document.md](use-cases/UC-003-format-document.md).

---

## Error messages

- Human-readable `message` is for UI display (English in library; i18n layer is consumer responsibility).
- Programmatic handling MUST use `code`, not string matching on `message`.

---

## Versioning

Follows [Semantic Versioning 2.0.0](https://semver.org/). Full policy: **[VERSIONING.md](VERSIONING.md)**.

Summary:

| Bump | When |
|------|------|
| **MAJOR** | Breaking public API or behavior change on previously valid input |
| **MINOR** | New validator module or backward-compatible export |
| **PATCH** | Bug fix; official spec alignment without API break |

Pre-1.0 releases use `0.x.y` (alpha from `0.1.0-alpha`). Changelog: [CHANGELOG.md](../CHANGELOG.md).

Security-related validation fixes are **patch** releases — see [SECURITY.md](../SECURITY.md).

---

## Out of scope for public API

- HTTP clients (Correios, RFB) — separate `@br-validators/adapters` package
- Database migrations or ORM types
- React/Vue input components — separate optional UI package
