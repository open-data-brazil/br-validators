import { CNPJ_ALPHANUMERIC_PATTERN, CNPJ_BASE_LENGTH, CNPJ_DV1_WEIGHTS, CNPJ_DV2_WEIGHTS, CNPJ_LENGTH } from './constants.js';
import { cnpjCharValue } from './ascii-value.js';
import { computeCheckDigit } from './modulo11.js';

function hasRepeatedChars(value: string): boolean {
  const first = value[0];
  for (let i = 1; i < value.length; i++) {
    if (value[i] !== first) {
      return false;
    }
  }
  return true;
}

function isValidStructure(canonical: string): boolean {
  return canonical.length === CNPJ_LENGTH && CNPJ_ALPHANUMERIC_PATTERN.test(canonical);
}

/**
 * Alphanumeric CNPJ — ASCII-48 modulo 11 (RFB Q14).
 * Golden vector: 12ABC34501DE35
 */
export function isValidCnpjAlphanumeric(input: string): boolean {
  const canonical = input.toUpperCase();
  if (!isValidStructure(canonical)) {
    return false;
  }
  if (hasRepeatedChars(canonical)) {
    return false;
  }

  const base = canonical.slice(0, CNPJ_BASE_LENGTH);
  const dv1Expected = String(computeCheckDigit(base, CNPJ_DV1_WEIGHTS, cnpjCharValue));
  const dv2Expected = String(
    computeCheckDigit(base + dv1Expected, CNPJ_DV2_WEIGHTS, cnpjCharValue),
  );

  return canonical.slice(CNPJ_BASE_LENGTH) === dv1Expected + dv2Expected;
}
