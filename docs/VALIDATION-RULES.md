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

## PIS / PASEP

### BR-PIS-001 — Length

- **GIVEN** stripped input
- **WHEN** length ≠ 11
- **THEN** reject with `INVALID_LENGTH`

### BR-PIS-002 — Numeric only

- **GIVEN** stripped input
- **WHEN** contains non-digit characters
- **THEN** reject with `INVALID_CHARACTER`

### BR-PIS-003 — Known invalid sequence

- **GIVEN** all 11 digits are identical (e.g. `11111111111`)
- **WHEN** validating
- **THEN** reject with `KNOWN_INVALID_PATTERN`

### BR-PIS-004 — Check digit

- **GIVEN** first 10 digits
- **WHEN** modulo-11 check digit does not match position 11
- **THEN** reject with `INVALID_CHECK_DIGIT`

### BR-PIS-005 — Weights

- **GIVEN** DV calculation on base digits
- **WHEN** applying weights
- **THEN** use `[3,2,9,8,7,6,5,4,3,2]` on first 10 digits

### BR-PIS-006 — Format mask

- **GIVEN** valid canonical 11-digit PIS/PASEP
- **WHEN** formatting
- **THEN** output `XXX.XXXXX.XX-X`

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

### BR-PIX-005 — Email format

- **GIVEN** email PIX key
- **WHEN** validating
- **THEN** require DICT regex, max 77 chars, lowercase only

### BR-PIX-006 — Detection precedence

- **GIVEN** arbitrary input
- **WHEN** detecting type
- **THEN** apply order: `@` → email; `+` → phone; UUID → evp; 11 digits → cpf; CNPJ pattern → cnpj

### BR-PIX-007 — Strict type option

- **GIVEN** forced `type` option
- **WHEN** detected type differs from forced type
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-PIX-008 — CNPJ alphanumeric keys

- **GIVEN** CNPJ-shaped PIX key with letters
- **WHEN** validating
- **THEN** delegate to alphanumeric CNPJ validator (RFB Q14)

---

## Boleto (cobrança bancária)

### BR-BOLETO-001 — Input kind detection

- **GIVEN** trimmed input
- **WHEN** detecting kind
- **THEN** classify as `linha-digitavel` (47 digits), `codigo-barras` (44 digits), or `unknown`

### BR-BOLETO-002 — Linha field DVs

- **GIVEN** 47-digit linha digitável
- **WHEN** validating fields 1–3
- **THEN** each field DV must match modulo 10 (Anexo IX)

### BR-BOLETO-003 — Barcode general DV

- **GIVEN** 44-digit código de barras
- **WHEN** validating position 5
- **THEN** DV must match modulo 11 (Anexo X); never `0`

### BR-BOLETO-004 — Currency code

- **GIVEN** bank boleto input
- **WHEN** position 4 (currency) ≠ `9`
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-BOLETO-005 — Field 4 consistency

- **GIVEN** valid linha digitável
- **WHEN** field 4 DV checked
- **THEN** must match modulo 11 of converted barcode

### BR-BOLETO-006 — Conversion

- **GIVEN** valid linha or barcode
- **WHEN** converting counterpart
- **THEN** apply Anexo VI mapping losslessly

### BR-BOLETO-007 — Strict kind option

- **GIVEN** forced `kind` option
- **WHEN** detected kind differs
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-BOLETO-008 — Masked linha

- **GIVEN** linha with dots/spaces
- **WHEN** validating
- **THEN** strip non-digits before structural checks

### BR-BOLETO-009 — Arrecadação out of scope

- **GIVEN** 48-digit input starting with `8`
- **WHEN** validating in v1
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-BOLETO-010 — Barcode DV edge cases

- **GIVEN** modulo 11 result 0, 10, or 11
- **WHEN** computing barcode DV
- **THEN** use DV `1`

---

## Credit card (Luhn / ISO/IEC 7812-1)

### BR-LUHN-001 — Strip to digits

- **GIVEN** masked PAN with spaces or hyphens
- **WHEN** stripping
- **THEN** remove all non-digit characters

### BR-LUHN-002 — PAN length

- **GIVEN** stripped PAN
- **WHEN** validating
- **THEN** accept length 8–19 inclusive; reject otherwise with `INVALID_LENGTH`

### BR-LUHN-003 — Luhn checksum

- **GIVEN** stripped PAN within length bounds
- **WHEN** validating
- **THEN** apply ISO/IEC 7812-1 Annex B modulus-10 from rightmost digit; valid iff sum mod 10 = 0
- **Golden:** `79927398713` pass; `79927398710` fail

### BR-LUHN-004 — Reject all-same-digit

- **GIVEN** PAN where every digit is identical
- **WHEN** validating
- **THEN** reject with `KNOWN_INVALID_PATTERN` even if Luhn passes

### BR-LUHN-005 — Brand detection (best-effort)

- **GIVEN** stripped PAN
- **WHEN** detecting brand
- **THEN** return `visa` | `mastercard` | `amex` | `elo` | `hipercard` | `unknown` from IIN prefix heuristics (non-authoritative)

### BR-LUHN-006 — Invalid characters

- **GIVEN** input with letters after removing spaces/hyphens
- **WHEN** validating
- **THEN** reject with `INVALID_CHARACTER`

### BR-LUHN-007 — Display mask

- **GIVEN** valid 16-digit PAN
- **WHEN** formatting
- **THEN** group as `XXXX XXXX XXXX XXXX`
- **GIVEN** valid 15-digit Amex PAN
- **WHEN** formatting
- **THEN** group as `XXXX XXXXXX XXXXX`

### BR-LUHN-008 — Boolean Luhn wrapper

- **GIVEN** any input
- **WHEN** calling `isValidLuhn`
- **THEN** strip → length check → character check → Luhn; return boolean without branded type

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
