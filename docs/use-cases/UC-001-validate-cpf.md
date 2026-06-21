# Use Case: UC-001 — Validate and format CPF

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-001 |
| Actor | Application developer / end-user form |
| Status | Approved |

## Preconditions

- Input may contain mask characters (`.` `-`) or be raw digits
- Alphanumeric CPF is **out of scope** until RFB publishes official spec

## Main flow (happy path)

1. Consumer calls `stripCpf(input)` → 11 digits
2. Consumer calls `validateCpf(stripped)` → `{ ok: true, value: '12345678909' }`
3. Consumer calls `formatCpf(stripped)` → `{ ok: true, formatted: '123.456.789-09' }`

## Alternate flows

### AF-1: Invalid check digit

- **When:** Modulo 11 fails
- **Then:** `{ ok: false, code: 'INVALID_CHECK_DIGIT' }`

### AF-2: Known invalid pattern

- **When:** All digits identical
- **Then:** `{ ok: false, code: 'KNOWN_INVALID_PATTERN' }`

### AF-3: Wrong length after strip

- **When:** Length ≠ 11
- **Then:** `{ ok: false, code: 'INVALID_LENGTH' }`

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-CPF-001 | Length check |
| BR-CPF-002 | Numeric only |
| BR-CPF-003 | Reject all-same-digit |
| BR-CPF-004 | Modulo 11 |
| BR-CPF-005 | Official mask |
| BR-GLOBAL-001 | Strip first |
| BR-GLOBAL-002 | Validate before format |

## Domain events raised

None — pure library, no events.

## Authorization

N/A — client-side/server-side library call.

## Out of scope

- Consulta online na Receita Federal
- Alphanumeric CPF (2026+ TBD)

## Official sources

| Purpose | URL |
|---------|-----|
| **Primary — RFB CPF** | [RFB CPF portal](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) |
| **Golden vectors** | `tests/vectors/cpf.official.json` — `12345678909`, `11144477735` |
| **Library constant** | `CPF_OFFICIAL_SOURCE_URL` |
