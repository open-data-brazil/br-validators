# Use Case: UC-008 — Validate and format credit card PAN

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-008 |
| Actor | Application developer / payment form |
| Status | Approved |

## Preconditions

- Input may contain spaces or hyphens (display separators)
- Validation is **Luhn checksum only** — no payment authorization, CVV, or expiry
- PAN length per ISO/IEC 7812-1: **8–19 digits** after strip

## Main flow (happy path)

1. Consumer calls `stripCartaoCredito(input)` → digits only
2. Consumer calls `validateCartaoCredito(stripped)` → `{ ok: true, value, format: 'cartao-credito', brand }`
3. Consumer calls `formatCartaoCredito(stripped)` → grouped display mask
4. Optional: `detectCardBrand(stripped)` for best-effort IIN heuristics

## Alternate flows

### AF-1: Invalid Luhn check digit

- **When:** Modulus-10 sum ≠ 0
- **Then:** `{ ok: false, code: 'INVALID_CHECK_DIGIT' }`

### AF-2: Known invalid pattern

- **When:** All digits identical
- **Then:** `{ ok: false, code: 'KNOWN_INVALID_PATTERN' }`

### AF-3: Wrong length after strip

- **When:** Length < 8 or > 19
- **Then:** `{ ok: false, code: 'INVALID_LENGTH' }`

### AF-4: Invalid characters

- **When:** Letters or symbols remain after removing spaces/hyphens
- **Then:** `{ ok: false, code: 'INVALID_CHARACTER' }`

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-LUHN-001 | Strip to digits |
| BR-LUHN-002 | PAN length 8–19 |
| BR-LUHN-003 | Luhn modulus-10 (ISO 7812-1 Annex B) |
| BR-LUHN-004 | Reject all-same-digit |
| BR-LUHN-005 | Best-effort brand from IIN (non-authoritative) |
| BR-LUHN-006 | Strip mask characters |
| BR-LUHN-007 | Grouped display (16: 4×4, Amex 15: 4-6-5) |
| BR-LUHN-008 | `isValidLuhn` boolean wrapper |
| BR-GLOBAL-001 | Strip first |
| BR-GLOBAL-002 | Validate before format |

## Domain events raised

None — pure library, no events.

## Authorization

N/A — client-side/server-side library call.

## Out of scope

- CVV / CVC validation
- Expiry date
- Payment authorization or BIN lookup API
- 3-D Secure

## Golden vectors

| Canonical | Masked / notes | Brand | Source |
|-----------|----------------|-------|--------|
| `4111111111111111` | `4111 1111 1111 1111` | visa | Test PAN (widely published) |
| `5555555555554444` | — | mastercard | Test PAN |
| `378282246310005` | — | amex | Test PAN (15 digits) |
| `79927398713` | — | unknown | ISO 7812-1 Annex B Luhn walkthrough |
| `12345674` | `1234 5674` | unknown | Minimum length 8-digit pass |

## Official sources

| Purpose | URL |
|---------|-----|
| **Normative — Luhn (Annex B)** | [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) |
| **IEC webstore mirror** | [IEC 7812-1](https://webstore.iec.ch/en/publication/59763) |
| **Cross-check walkthrough** | [Luhn algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Luhn_algorithm) — illustrative only |

> Brand IIN tables are heuristic for UX (Visa/Mastercard/Amex/Elo/Hipercard). They are **not** normative BIN registries.
