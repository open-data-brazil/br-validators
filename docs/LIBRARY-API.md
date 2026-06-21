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
| `br-validators/pis-pasep` | PIS / PASEP / NIS / NIT |
| `br-validators/pix` | PIX keys |
| `br-validators/boleto` | Boleto (linha digitável + código de barras) |
| `br-validators/cartao-credito` | Credit card PAN (Luhn / ISO 7812) |
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
type PisPasep = string & { readonly __brand: 'PisPasep' };
type PixKey = string & { readonly __brand: 'PixKey' };
type PisPasep = string & { readonly __brand: 'PisPasep' };
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
| `validateCep` | `(input: string) => ValidationResult<Cep>` | Structural validation only |
| `formatCep` | `(input: string) => FormatResult` | `XXXXX-XXX` |

---

## Core API — License plate (Placa)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `detectPlacaFormat` | `(input: string) => 'legacy' \| 'mercosul' \| 'unknown'` | |
| `isValidPlacaLegacy` | `(input: string) => boolean` | `LLLNNNN` |
| `isValidPlacaMercosul` | `(input: string) => boolean` | `LLLNLNN` |
| `isValidPlaca` | `(input: string) => boolean` | Either format |
| `validatePlaca` | `(input: string) => ValidationResult<Placa>` | `{ format: 'legacy' \| 'mercosul' }` on success |
| `convertPlacaToMercosul` | `(input: string) => FormatResult` | Legacy → Mercosul where mappable |
| `formatPlaca` | `(input: string) => FormatResult` | Uppercase, no hyphen |
| `stripPlaca` | `(input: string) => string` | Uppercase, remove hyphen/spaces |

---

## Core API — PIS / PASEP

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripPisPasep` | `(input: string) => string` | Remove non-digits |
| `isValidPisPasep` | `(input: string) => boolean` | Modulo 11, reject known invalid patterns |
| `validatePisPasep` | `(input: string) => ValidationResult<PisPasep>` | Full result with canonical 11 digits |
| `formatPisPasep` | `(input: string) => FormatResult` | `XXX.XXXXX.XX-X` after validation |

**Invariants:** Output canonical form is exactly 11 digits. Covers PIS, PASEP, NIS, and NIT (same CNIS algorithm).

---

## Core API — PIX key

| Function | Signature | Behavior |
|----------|-----------|----------|
| `detectPixKeyType` | `(input: string) => PixKeyType \| 'unknown'` | Bacen precedence rules |
| `isValidPixKey` | `(input: string, options?) => boolean` | Delegates by detected or forced type |
| `validatePixKey` | `(input: string, options?) => PixValidationResult` | Success includes `keyType` + `format` |

```typescript
type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

type PixValidationResult =
  | { ok: true; value: PixKey; keyType: PixKeyType; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string; keyType?: PixKeyType };

type ValidatePixKeyOptions = { type?: PixKeyType };
```

Phone keys: E.164 with `+55` Brazilian mobile per DICT. EVP: lowercase UUID with hyphens. Email: DICT regex, max 77, lowercase.

---

## Core API — Boleto

| Function | Signature | Behavior |
|----------|-----------|----------|
| `detectBoletoInputKind` | `(input: string) => DetectedBoletoInputKind` | `linha-digitavel` \| `codigo-barras` \| `unknown` |
| `validateBoleto` | `(input: string, options?: ValidateBoletoOptions) => BoletoValidationResult` | Auto-detect + validate |
| `validateLinhaDigitavel` | `(input: string) => BoletoValidationResult` | 47 digits, modulo 10 field DVs |
| `validateCodigoBarras` | `(input: string) => BoletoValidationResult` | 44 digits, modulo 11 barcode DV |
| `convertLinhaToCodigoBarras` | `(input: string) => BoletoValidationResult` | Validate linha → return barcode |
| `convertCodigoBarrasToLinhaDigitavel` | `(input: string) => BoletoValidationResult` | Validate barcode → return linha |
| `stripLinhaDigitavel` | `(input: string) => string` | Remove non-digits |
| `formatLinhaDigitavel` | `(stripped47: string) => string` | Masked display format |
| `isValidBoleto` | `(input: string, options?) => boolean` | Boolean wrapper |

```typescript
type BoletoInputKind = 'linha-digitavel' | 'codigo-barras';

type BoletoValidationResult =
  | { ok: true; value: LinhaDigitavel | CodigoBarras; inputKind: BoletoInputKind; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string; inputKind?: BoletoInputKind };

type ValidateBoletoOptions = { kind?: BoletoInputKind };
```

Golden vectors: Santander linha `03399025790899183400671742301014614500000099668` ↔ barcode `03396145000000996689025708991834007174230101`.

---

## Core API — Credit card (Luhn)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripCartaoCredito` | `(input: string) => string` | Remove non-digits |
| `passesLuhn` | `(pan: string) => boolean` | Raw Luhn on digit string |
| `computeLuhnSum` | `(pan: string) => number` | Annex B sum (internal/testing) |
| `isValidLuhn` | `(input: string) => boolean` | Strip → length → chars → Luhn |
| `isValidCartaoCredito` | `(input: string) => boolean` | Full validation boolean |
| `validateCartaoCredito` | `(input: string) => CartaoCreditoValidationResult` | Luhn + length + brand on success |
| `detectCardBrand` | `(strippedPan: string) => CardBrand` | Best-effort IIN heuristics |
| `formatCartaoCredito` | `(input: string) => FormatResult` | Grouped display after validation |

```typescript
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'unknown';

type CartaoCredito = string & { readonly __brand: 'CartaoCredito' };

type CartaoCreditoValidationResult =
  | { ok: true; value: CartaoCredito; format: 'cartao-credito'; brand: CardBrand }
  | { ok: false; code: ValidationErrorCode; message: string; brand?: CardBrand };
```

Golden vectors: Visa `4111111111111111`, Mastercard `5555555555554444`, Amex `378282246310005`, Luhn walkthrough `79927398713`.

---

## Format pipeline (convenience)

High-level helper used by UI formatters:

```typescript
type FormattableDocumentType =
  | 'cpf' | 'cnpj' | 'cep' | 'placa' | 'pis-pasep' | 'pix' | 'boleto' | 'cartao-credito';

function formatDocument(type: FormattableDocumentType, input: string): FormatResult;
function formatDocumentRuntime(type: string, input: string): FormatResult;
function isFormattableDocumentType(type: string): type is FormattableDocumentType;
```

Per-type formatters: `formatCpf`, `formatCnpj`, `formatCep`, `formatPlaca`, `formatPisPasep`, `formatPixKey`, `formatBoleto`, `formatCartaoCredito`.

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
