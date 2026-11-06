# Use Case: UC-003 — Format document from raw input

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-003 |
| Actor | Frontend masked input / API normalizer |
| Status | Approved |

## Preconditions

- Consumer has raw or partially formatted user input
- Document type is known (`cpf` | `cnpj` | `cep` | `placa`)

## Main flow (happy path)

1. User types or pastes `00012300012`
2. Consumer calls `formatDocument('cpf', input)`
3. Library strips non-digits
4. Library validates modulo 11
5. Returns `{ ok: true, formatted: '000.123.000-12' }`

## Alternate flows

### AF-1: Invalid input

- **When:** Validation fails at step 4
- **Then:** `{ ok: false, code: ... }` — **no partial mask applied**

### AF-2: Already formatted input

- **When:** Input is `000.123.000-12`
- **Then:** Strip → validate → return same canonical mask (idempotent)

### AF-3: CNPJ auto-detect

- **When:** Type is `cnpj` and input may be numeric or alphanumeric
- **Then:** Detect format, validate appropriate path, apply correct mask

### AF-4: Consumer pads partial input in `onChange` (anti-pattern)

- **When:** App helper calls `padStart(11, '0')` (or similar) before applying punctuation, then wires that helper to `onChange`
- **Then:** Single keystroke `"0"` becomes `000.000.000-00` — **this is not library behavior**; `@br-validators/core` rejects incomplete input in `format*` / `mask()`
- **Fix:** Progressive UI mask without padding during typing; use `strip*` / `sanitize()` (and optional `padStart` only if required) at **submit/API** boundary. See [LIBRARY-API.md § Consumer warning](../LIBRARY-API.md#consumer-warning--display-formatting-vs-backend-normalization)

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-GLOBAL-001 | Strip before validate |
| BR-GLOBAL-002 | Validate before format |
| BR-GLOBAL-003 | No silent correction |
| Type-specific BR-* rules | Per document |

## Domain events raised

None.

## Authorization

N/A.

## Out of scope

- Live formatting of incomplete input while typing (consumer UI concern; library may offer `formatPartial` later as separate API)

## References

- [LIBRARY-API.md](../LIBRARY-API.md#format-pipeline-convenience)
- [ARCHITECTURE.md](../ARCHITECTURE.md#decorator-flow-format-pipeline)
