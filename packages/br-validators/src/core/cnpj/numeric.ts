import { CNPJ_BASE_LENGTH, CNPJ_DV1_WEIGHTS, CNPJ_DV2_WEIGHTS, CNPJ_NUMERIC_PATTERN } from './constants.js';
import { computeCheckDigit } from './modulo11.js';

function digitValue(char: string): number {
  return Number(char);
}

function hasRepeatedDigits(value: string): boolean {
  const first = value[0];
  for (let i = 1; i < value.length; i++) {
    if (value[i] !== first) {
      return false;
    }
  }
  return true;
}

/**
 * Numeric CNPJ — traditional modulo 11 on digits (RFB Q6–Q7 coexistence).
 */
export function isValidCnpjNumeric(input: string): boolean {
  const canonical = input.replace(/\D/g, '');
  if (!CNPJ_NUMERIC_PATTERN.test(canonical)) {
    return false;
  }
  if (hasRepeatedDigits(canonical)) {
    return false;
  }

  const base = canonical.slice(0, CNPJ_BASE_LENGTH);
  const dv1Expected = String(computeCheckDigit(base, CNPJ_DV1_WEIGHTS, digitValue));
  const dv2Expected = String(
    computeCheckDigit(base + dv1Expected, CNPJ_DV2_WEIGHTS, digitValue),
  );

  return canonical.slice(CNPJ_BASE_LENGTH) === dv1Expected + dv2Expected;
}
