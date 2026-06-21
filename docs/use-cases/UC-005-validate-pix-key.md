# Use Case: UC-005 — Validate PIX key

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-005 |
| Actor | Payment app / checkout form |
| Status | Approved |

## Preconditions

- Bacen defines five PIX key types: CPF, CNPJ, email, phone (+55), EVP (UUID)
- CNPJ keys must support dual-format validation (UC-002)

## Main flow (happy path)

1. Consumer receives PIX key string
2. `detectPixKeyType(input)` → e.g. `'email'`
3. `validatePixKey(input)` delegates:
   - **cpf** → `validateCpf`
   - **cnpj** → `validateCnpj` (numeric or alphanumeric)
   - **email** → RFC 5322 practical subset per Bacen limits
   - **phone** → E.164 with `+55` prefix
   - **evp** → UUID v4 format
4. Return `{ ok: true, value, format: type }`

## Alternate flows

### AF-1: Ambiguous input

- **When:** String could match multiple types (rare — e.g. numeric-only)
- **Then:** Apply Bacen precedence rules documented in implementation; return `unknown` if unresolved

### AF-2: Valid CPF but wrong type context

- **When:** Consumer forces type `email` but input is CPF-shaped
- **Then:** Fail validation for forced type (optional strict API)

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-PIX-001 | Type detection |
| BR-PIX-002 | Delegate CPF/CNPJ |
| BR-PIX-003 | Phone E.164 +55 |
| BR-PIX-004 | EVP UUID |

## Domain events raised

None.

## Authorization

N/A.

## Out of scope

- BR Code QR payload parsing (separate module — see ROADMAP Phase 3)
- DICT key registration lookup at Bacen

## References

- [OFFICIAL-SOURCES.md](../OFFICIAL-SOURCES.md) — Manual BR Code, Anexo I PIX
- [LIBRARY-API.md](../LIBRARY-API.md#core-api--pix-key)
