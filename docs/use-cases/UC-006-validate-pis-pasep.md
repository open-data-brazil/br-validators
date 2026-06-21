# Use Case: UC-006 — Validate and format PIS/PASEP

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-006 |
| Actor | Application developer / end-user form |
| Status | Approved |

## Preconditions

- Input may contain mask characters (`.` `-`) or be raw digits
- PIS, PASEP, NIS, and NIT share the same 11-digit algorithm

## Main flow (happy path)

1. Consumer calls `stripPisPasep(input)` → 11 digits
2. Consumer calls `validatePisPasep(stripped)` → `{ ok: true, value: '10027230888' }`
3. Consumer calls `formatPisPasep(stripped)` → `{ ok: true, formatted: '100.27230.88-8' }`

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
| BR-PIS-001 | Length check |
| BR-PIS-002 | Numeric only |
| BR-PIS-003 | Reject all-same-digit |
| BR-PIS-004 | Modulo 11 |
| BR-PIS-005 | Official weights |
| BR-PIS-006 | Official mask |
| BR-GLOBAL-001 | Strip first |
| BR-GLOBAL-002 | Validate before format |

## Domain events raised

None — pure library, no events.

## Authorization

N/A — client-side/server-side library call.

## Out of scope

- CNIS / eSocial HTTP lookup
- Distinguishing PIS vs PASEP vs NIS by number range

## Golden vectors

| Canonical | Masked | Source |
|-----------|--------|--------|
| `10027230888` | `100.27230.88-8` | UC-006 worked example; DV verified per RV_03 NIT standard |
| `12056456402` | `120.56456.40-2` | Algorithm cross-check |

## Official sources

| Purpose | URL |
|---------|-----|
| **Validation rules (RV_03)** — format, reject all-same-digit, NIT check digit | [SIPREV Regras de Validação v1.14 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) |
| **Administrative context** — PIS updates via Caixa (private sector), PASEP via Banco do Brasil (public sector) | [eSocial FAQ — histórico](https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes/historico-de-perguntas-frequentes) |

> **Deprecated:** `https://www.gov.br/caixa/pt-br/atendimento/beneficios/pis` returns 404 (June 2026). It never published the modulo-11 algorithm; RV_03 is the correct checksum reference.
