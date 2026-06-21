# CNPJ alphanumeric — implementation reference

> **Priority P0.** Production rollout July 2026. SEFAZ homologation from April 2026.
> Sources: IN RFB 2.229/2024, [RFB FAQ PDF](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf), [SERPRO DV PDF](https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf)

---

## Format

| Position | Content | Notes |
|----------|---------|-------|
| 1–12 | `[A-Z0-9]` | Base identifier (alphanumeric) |
| 13–14 | `[0-9]` | Check digits (always numeric) |

**Regex (validation):** `^[A-Z0-9]{12}[0-9]{2}$` after strip and uppercase.

**Display mask (numeric CNPJ):** `XX.XXX.XXX/XXXX-DD` — alphanumeric display mask to follow RFB when finalized.

---

## Character value (ASCII − 48)

Each of the first 12 characters maps to an integer:

```
value(char) = char.charCodeAt(0) - 48
```

Examples:

| Char | ASCII | Value |
|------|-------|-------|
| `0` | 48 | 0 |
| `9` | 57 | 9 |
| `A` | 65 | 17 |
| `B` | 66 | 18 |
| `Z` | 90 | 42 |

Applies to **both** letters and digits in the base — this replaces “digit only” multiplication in numeric CNPJ.

---

## First check digit (DV1)

1. Take characters at positions 1–12 (base).
2. Multiply each character’s value by weight from position 1→12:

   **Weights DV1:** `5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2`

3. Sum products.
4. `remainder = sum % 11`
5. If `remainder < 2` → DV1 = `0`; else DV1 = `11 - remainder`

---

## Second check digit (DV2)

1. Take base (12 chars) + DV1 (1 char) = 13 characters.
2. Multiply each character’s value by weight from position 1→13:

   **Weights DV2:** `6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2`

3. Sum products.
4. Same remainder rule as DV1.

---

## Golden example (RFB FAQ Q14)

**Primary source:** [RFB CNPJ alfanumérico PDF — Question 14](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf)

Base: `12.ABC.345/01DE` → canonical base `12ABC34501DE`

| Pos | Char | Value (ASCII−48) | W1 | Prod |
|-----|------|------------------|-----|------|
| 1 | 1 | 1 | 5 | 5 |
| 2 | 2 | 2 | 4 | 8 |
| 3 | A | 17 | 3 | 51 |
| 4 | B | 18 | 2 | 36 |
| 5 | C | 19 | 9 | 171 |
| 6 | 3 | 3 | 8 | 24 |
| 7 | 4 | 4 | 7 | 28 |
| 8 | 5 | 5 | 6 | 30 |
| 9 | 0 | 0 | 5 | 0 |
| 10 | 1 | 1 | 4 | 4 |
| 11 | D | 20 | 3 | 60 |
| 12 | E | 21 | 2 | 42 |

**DV1:** Sum = **459** → 459 mod 11 = 8 → DV1 = 11 − 8 = **3**

**DV2:** Base + DV1 → sum = **424** → 424 mod 11 = 6 → DV2 = 11 − 6 = **5**

| Form | Value |
|------|-------|
| **Canonical (14 chars)** | **`12ABC34501DE35`** |
| **Masked** | **`12.ABC.345/01DE-35`** |

This vector is mandatory in `tests/vectors/cnpj.official.json` before merge.

**Homologation:** [Simulador Nacional CNPJ](https://servicos.receitafederal.gov.br/servico/cnpj-alfa/simular) (RFB Q47–Q50) for manual QA with fictitious data.

---

## Numeric CNPJ (existing — must remain supported)

- 14 digits, modulo 11 with weights `[5,4,3,2,9,8,7,6,5,4,3,2]` and `[6,5,4,3,2,9,8,7,6,5,4,3,2]` on digits (not ASCII values).
- Reject known invalid (all same digit).
- `isValidCnpj(input)` = `isValidCnpjNumeric(input) || isValidCnpjAlphanumeric(input)`.

---

## Detection logic

```
strip → uppercase
if /^[0-9]{14}$/           → try numeric validator
else if /^[A-Z0-9]{12}[0-9]{2}$/ → try alphanumeric validator
else                        → unknown / invalid
```

If input contains letters → **never** route to numeric-only path.

---

## Excluded letters (RFB Q45)

RFB Q45: **systems should accept all letters A–Z** in validation. Prohibited combinations are enforced **only at RFB issuance**, not in field validators.

```typescript
// cnpj/constants.ts — do not block letters client-side unless RFB publishes official list
export const EXCLUDED_CNPJ_LETTERS: ReadonlySet<string> = new Set([]);
```

If RFB later publishes an official exclusion list, update this constant in a patch release.

---

## Database and integration notes

| Rule | Rationale |
|------|-----------|
| Store as `VARCHAR(14)` or `CHAR(14)` | Alphanumeric breaks integer columns |
| Index as string | Lexicographic sort OK for lookup |
| Accept both formats in API | Migration period 2026+ |
| Log format detected | Audit trail during dual-format era |

---

## Related docs

- [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md)
- [use-cases/UC-002-validate-cnpj.md](use-cases/UC-002-validate-cnpj.md)
- [LIBRARY-API.md](LIBRARY-API.md#core-api--cnpj)
