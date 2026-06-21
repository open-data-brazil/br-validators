# Use Case: UC-002 — Validate numeric and alphanumeric CNPJ

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-002 |
| Actor | ERP / e-invoice (NF-e) integrator / form validator |
| Status | Approved |

## Preconditions

- System must accept both legacy 14-digit and new alphanumeric CNPJ during 2026 migration
- Database column is string type (14 chars)

## Main flow (happy path) — numeric

1. Input: `12.345.678/0001-95` (example — use official test vectors in tests)
2. `stripCnpj` → `12345678000195`
3. `detectCnpjFormat` → `'numeric'`
4. `validateCnpj` → `{ ok: true, value: '...', format: 'numeric' }`

## Main flow (happy path) — alphanumeric

1. Input: `12ABC34501DE` + valid check digits per SERPRO
2. `stripCnpj` → uppercase canonical 14 chars
3. `detectCnpjFormat` → `'alphanumeric'`
4. For each base char, value = ASCII − 48
5. Apply DV1 weights `[5,4,3,2,9,8,7,6,5,4,3,2]`, then DV2 weights `[6,5,4,3,2,9,8,7,6,5,4,3,2]`
6. `validateCnpj` → `{ ok: true, format: 'alphanumeric' }`

## Alternate flows

### AF-1: Letters in input but invalid alphanumeric

- **When:** Contains letters but DV or structure fails
- **Then:** `{ ok: false, code: 'INVALID_CHECK_DIGIT' }` — do not fall back to numeric path

### AF-2: Numeric path with letters

- **When:** Input has letters
- **Then:** Never route to numeric-only validator

### AF-3: Excluded letters (future)

- **When:** RFB confirms excluded set and input contains excluded letter
- **Then:** `{ ok: false, code: 'INVALID_CHARACTER' }`

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-CNPJ-N-001 … N-003 | Numeric CNPJ |
| BR-CNPJ-A-001 … A-006 | Alphanumeric CNPJ |
| BR-GLOBAL-001 | Strip first |

## Domain events raised

None.

## Authorization

N/A.

## Out of scope

- Consulta CNPJ na Receita Federal
- IE (state registration) validation

## References

- [CNPJ-ALPHANUMERIC.md](../CNPJ-ALPHANUMERIC.md)
- [OFFICIAL-SOURCES.md](../OFFICIAL-SOURCES.md)

## Official sources

| Purpose | URL |
|---------|-----|
| **Primary — RFB FAQ (Q14)** | [CNPJ alfanumérico PDF](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) |
| **DV calculation** | [SERPRO DV PDF](https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf) |
| **Homologation** | [Simulador Nacional CNPJ](https://servicos.receitafederal.gov.br/servico/cnpj-alfa/simular) |
| **Golden vector** | `12ABC34501DE35` — `tests/vectors/cnpj.official.json` |
| **Library constant** | `CNPJ_OFFICIAL_SOURCE_URL` |
