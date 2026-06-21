# Use Case: UC-004 — Validate license plate (legacy + Mercosul)

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-004 |
| Actor | Vehicle registration system / parking app |
| Status | Approved |

## Preconditions

- Input normalized to uppercase without hyphen (Brazilian plates omit hyphen in most systems)
- Both legacy (`ABC1234`) and Mercosul (`ABC1D23`) plates remain valid indefinitely

## Main flow (happy path) — Mercosul

1. Input: `abc1d23`
2. Strip/normalize → `ABC1D23`
3. `detectPlacaFormat` → `'mercosul'`
4. `isValidPlaca` → true

## Main flow (happy path) — Legacy

1. Input: `ABC1234`
2. `detectPlacaFormat` → `'legacy'`
3. `isValidPlaca` → true

## Alternate flow — Convert legacy to Mercosul

1. Valid legacy plate `ABC1234`
2. `convertPlacaToMercosul('ABC1234')` → mapped Mercosul equivalent per CONTRAN rules
3. Return formatted result or error if unmappable

## Alternate flows

### AF-1: Invalid pattern

- **When:** Neither legacy nor Mercosul regex matches
- **Then:** `{ ok: false, code: 'INVALID_CHARACTER' }` or `INVALID_LENGTH`

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-PLACA-001 | Legacy format |
| BR-PLACA-002 | Mercosul format |
| BR-PLACA-003 | Union validator |

## Domain events raised

None.

## Authorization

N/A.

## Out of scope

- RENAVAM validation (11 digits, different rules)
- Detran online plate lookup

## References

- [OFFICIAL-SOURCES.md](../OFFICIAL-SOURCES.md) — CONTRAN 729/2018, Resolução 969/2022
