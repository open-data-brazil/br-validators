# Validation business rules

> Format: GIVEN / WHEN / THEN. Referenced by use cases and unit tests.
> Rule IDs are stable — cite in commits and test descriptions.

---

## CPF

### BR-CPF-001 — Length

- **GIVEN** stripped input
- **WHEN** length ≠ 11
- **THEN** reject with `INVALID_LENGTH`

### BR-CPF-002 — Numeric only

- **GIVEN** stripped input
- **WHEN** contains non-digit characters
- **THEN** reject with `INVALID_CHARACTER`

### BR-CPF-003 — Known invalid sequence

- **GIVEN** all 11 digits are identical (e.g. `11111111111`)
- **WHEN** validating
- **THEN** reject with `KNOWN_INVALID_PATTERN`

### BR-CPF-004 — Check digits

- **GIVEN** first 9 digits
- **WHEN** modulo-11 check digits do not match positions 10 and 11
- **THEN** reject with `INVALID_CHECK_DIGIT`

### BR-CPF-005 — Format mask

- **GIVEN** valid canonical 11-digit CPF
- **WHEN** formatting
- **THEN** output `XXX.XXX.XXX-DD`

---

## CNPJ numeric

### BR-CNPJ-N-001 — Length

- **GIVEN** stripped input
- **WHEN** length ≠ 14 or contains non-digits
- **THEN** reject appropriately

### BR-CNPJ-N-002 — Known invalid sequence

- **GIVEN** all 14 digits identical
- **WHEN** validating
- **THEN** reject with `KNOWN_INVALID_PATTERN`

### BR-CNPJ-N-003 — Check digits

- **GIVEN** first 12 digits
- **WHEN** modulo-11 DV1/DV2 fail
- **THEN** reject with `INVALID_CHECK_DIGIT`

---

## CNPJ alphanumeric

### BR-CNPJ-A-001 — Structure

- **GIVEN** stripped uppercase input
- **WHEN** does not match `^[A-Z0-9]{12}[0-9]{2}$`
- **THEN** reject with `INVALID_LENGTH` or `INVALID_CHARACTER`

### BR-CNPJ-A-002 — Character value

- **GIVEN** each base character
- **WHEN** computing check digit
- **THEN** use `charCodeAt(0) - 48` (not digit-only parsing)

### BR-CNPJ-A-003 — Weights

- **GIVEN** DV1 calculation
- **WHEN** applying weights
- **THEN** use `[5,4,3,2,9,8,7,6,5,4,3,2]` on 12 base chars

- **GIVEN** DV2 calculation
- **WHEN** applying weights
- **THEN** use `[6,5,4,3,2,9,8,7,6,5,4,3,2]` on 13 chars (base + DV1)

### BR-CNPJ-A-004 — Remainder mapping

- **GIVEN** `sum % 11`
- **WHEN** remainder < 2
- **THEN** check digit = 0; else check digit = 11 - remainder

### BR-CNPJ-A-005 — Union validator

- **GIVEN** arbitrary CNPJ input
- **WHEN** calling `isValidCnpj`
- **THEN** succeed if **either** numeric **or** alphanumeric path validates

### BR-CNPJ-A-006 — Storage type advisory

- **GIVEN** consumer persists CNPJ
- **WHEN** choosing column type
- **THEN** documentation requires string type (14 chars) — never integer

---

## CEP

### BR-CEP-001 — Length and digits

- **GIVEN** stripped input
- **WHEN** length ≠ 8 or non-digits present
- **THEN** reject

### BR-CEP-002 — No check digit

- **GIVEN** valid 8-digit CEP
- **WHEN** validating
- **THEN** structural validation only — no DV algorithm

---

## Placa

### BR-PLACA-001 — Legacy format

- **GIVEN** uppercase stripped input
- **WHEN** matches `^[A-Z]{3}[0-9]{4}$`
- **THEN** accept as legacy

### BR-PLACA-002 — Mercosul format

- **GIVEN** uppercase stripped input
- **WHEN** matches `^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$`
- **THEN** accept as Mercosul

### BR-PLACA-003 — Union

- **GIVEN** input
- **WHEN** either legacy or Mercosul valid
- **THEN** `isValidPlaca` returns true

---

## PIX key

### BR-PIX-001 — Type detection

- **GIVEN** input string
- **WHEN** detecting type
- **THEN** classify as cpf | cnpj | email | phone | evp | unknown

### BR-PIX-002 — Delegate validation

- **GIVEN** detected type cpf or cnpj
- **WHEN** validating
- **THEN** delegate to respective validator (CNPJ dual-format)

### BR-PIX-003 — Phone format

- **GIVEN** phone key
- **WHEN** validating
- **THEN** require E.164 with country code +55 per Bacen

### BR-PIX-004 — EVP format

- **GIVEN** random key (EVP)
- **WHEN** validating
- **THEN** require UUID format per Bacen

---

## Global pipeline rules

### BR-GLOBAL-001 — Strip before validate

- **GIVEN** any masked input
- **WHEN** validating or formatting
- **THEN** strip/normalize first

### BR-GLOBAL-002 — Validate before format

- **GIVEN** format request
- **WHEN** validation fails
- **THEN** return error — do not partial-mask invalid input

### BR-GLOBAL-003 — No silent correction

- **GIVEN** invalid check digit
- **WHEN** any operation
- **THEN** never auto-correct or suggest “fixed” digit in core library

### BR-GLOBAL-004 — Official source required

- **GIVEN** new validator module
- **WHEN** opening PR
- **THEN** must cite entry in OFFICIAL-SOURCES.md and include golden vector
