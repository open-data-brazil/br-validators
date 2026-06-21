# Use Case: UC-009 — Validate and format Inscrição Estadual (SP, MT, DF)

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-009 |
| Actor | Application developer / fiscal onboarding form |
| Status | Approved |

## Preconditions

- **UF is required** in v1 (`SP`, `MT`, or `DF`) — no auto-detect across states
- Input may contain mask punctuation (dots, hyphens)
- Validation is **check digits only** — no SEFAZ/SINTEGRA registration lookup

## Main flow (happy path)

1. Consumer calls `stripInscricaoEstadual(input)` → digits only
2. Consumer calls `validateInscricaoEstadual(stripped, { uf })` → `{ ok: true, value, uf, format: 'inscricao-estadual' }`
3. Consumer calls `formatInscricaoEstadual(stripped, { uf })` → per-UF display mask (SP/DF) or canonical digits (MT)

## Alternate flows

### AF-1: Invalid check digit

- **When:** Modulo-11 DVs do not match SEFAZ/SINTEGRA roteiro
- **Then:** `{ ok: false, code: 'INVALID_CHECK_DIGIT', uf? }`

### AF-2: Wrong length after strip

- **When:** Length ≠ UF rule (SP 12, MT 9/11, DF 13)
- **Then:** `{ ok: false, code: 'INVALID_LENGTH' }`

### AF-3: Unsupported UF or format

- **When:** `uf` not in v1 set, SP rural `P…`, MT prefix ≠ `13`, DF prefix ≠ `07`, DF legacy 12-digit
- **Then:** `{ ok: false, code: 'UNSUPPORTED_FORMAT' }`

### AF-4: Empty input

- **When:** Blank or whitespace-only
- **Then:** `{ ok: false, code: 'EMPTY_INPUT' }`

### AF-5: UF mismatch

- **When:** Valid SP number validated with `{ uf: 'MT' }`
- **Then:** `{ ok: false, code: 'INVALID_CHECK_DIGIT' | 'UNSUPPORTED_FORMAT' }` per UF rules

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-IE-001 | UF required in v1 |
| BR-IE-SP-001 | SP 12-digit dual mod11 DVs |
| BR-IE-MT-001 | MT canonical 9-digit `13XXXXXXD` + legacy 11-digit zero-pad |
| BR-IE-DF-001 | DF 13-digit prefix `07` dual mod11 DVs |
| BR-IE-DF-002 | Reject DF legacy 12-digit |
| BR-GLOBAL-001 | Strip first |
| BR-GLOBAL-002 | Validate before format |

## Domain events raised

None — pure library, no events.

## Authorization

N/A — client-side/server-side library call.

## Out of scope

- Remaining 24 UFs (Phase 8b backlog)
- SP rural `P…` format (Regra II)
- SEFAZ HTTP registration lookup
- Auto-detect UF from length/prefix

## Golden vectors

| UF | Canonical | Masked | Source |
|----|-----------|--------|--------|
| SP | `110042490114` | `110.042.490.114` | [SEFAZ-SP Sintegra rotina](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) |
| MT | `130000019` (canonical) / `00130000019` (legacy) | — | [SEFAZ-MT Port. Art. 6º](https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=) |
| DF | `0730000100109` | `073.00001.001-09` | [Receita DF](https://www.receita.fazenda.df.gov.br/) · [SINTEGRA DF](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html) |

## Official sources

| UF | Primary URL |
|----|-------------|
| SP | https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx |
| SP (mirror) | http://www.sintegra.gov.br/Cad_Estados/cad_SP.html |
| MT | https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument= |
| MT (mirror) | http://www.sintegra.gov.br/Cad_Estados/cad_MT.html |
| DF | https://www.receita.fazenda.df.gov.br/ |
| DF (mirror) | http://www.sintegra.gov.br/Cad_Estados/cad_DF.html |

Cross-check mirrors: `http://www.sintegra.gov.br/Cad_Estados/cad_{SP,MT,DF}.html`
