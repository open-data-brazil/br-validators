/**
 * RENAVAM validation — modulo 11, peso 9 (DENATRAN / SENATRAN).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf
 * @see https://www.gov.br/pt-br/servicos/consultar-dados-de-veiculo-na-base-renavam
 */
import { stripRenavam } from '../../strip/index.js';
import type { Renavam, ValidationResult } from '../../types/validation-result.js';
import { brandRenavam } from '../../types/validation-result.js';
import { computeRenavamCheckDigit } from './check-digits.js';
import { RENAVAM_BASE_LENGTH, RENAVAM_LENGTH } from './constants.js';

export {
  RENAVAM_BASE_LENGTH,
  RENAVAM_DV_WEIGHTS,
  RENAVAM_GOLDEN_DASH_INPUT,
  RENAVAM_GOLDEN_DV_ZERO,
  RENAVAM_GOLDEN_LEADING_ZEROS,
  RENAVAM_GOLDEN_PRIMARY,
  RENAVAM_GOLDEN_SECONDARY,
  RENAVAM_LENGTH,
  RENAVAM_NUMERIC_PATTERN,
  RENAVAM_OFFICIAL_SOURCE_URL,
  RENAVAM_SENATRAN_CONSULTA_URL,
} from './constants.js';

type FailedResult = Extract<ValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
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

function isValidRenavamChecksum(stripped: string): boolean {
  const base = stripped.slice(0, RENAVAM_BASE_LENGTH);
  const expected = String(computeRenavamCheckDigit(base));
  return stripped.charAt(RENAVAM_BASE_LENGTH) === expected;
}

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'RENAVAM input is empty');
  }

  const withoutMask = input.replace(/-/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'RENAVAM contains invalid characters');
  }

  if (stripped.length !== RENAVAM_LENGTH) {
    return failure('INVALID_LENGTH', `RENAVAM must have ${RENAVAM_LENGTH} digits after normalization`);
  }

  if (hasRepeatedDigits(stripped)) {
    return failure('KNOWN_INVALID_PATTERN', 'RENAVAM with all identical digits is invalid');
  }

  return null;
}

export function isValidRenavam(input: string): boolean {
  return validateRenavam(input).ok;
}

export function validateRenavam(input: string): ValidationResult<Renavam> {
  const stripped = stripRenavam(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  if (isValidRenavamChecksum(stripped)) {
    return { ok: true, value: brandRenavam(stripped), format: 'numeric' };
  }

  return failure('INVALID_CHECK_DIGIT', 'RENAVAM check digit is invalid');
}
