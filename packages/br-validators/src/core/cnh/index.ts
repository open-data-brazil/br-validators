/**
 * CNH validation — Registro Nacional modulo 11 with inter-DV discount.
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf
 * @see https://www.gov.br/infraestrutura/pt-br/assuntos/transito/senatran
 */
import { stripCnh } from '../../strip/index.js';
import type { Cnh, ValidationResult } from '../../types/validation-result.js';
import { brandCnh } from '../../types/validation-result.js';
import { computeCnhCheckDigits } from './check-digits.js';
import { CNH_BASE_LENGTH, CNH_LENGTH } from './constants.js';

export {
  CNH_BASE_LENGTH,
  CNH_DV1_WEIGHTS,
  CNH_DV2_WEIGHTS,
  CNH_GOLDEN_DISCOUNT_CASE,
  CNH_GOLDEN_PRIMARY,
  CNH_GOLDEN_PRIMARY_DECORATED_INPUT,
  CNH_GOLDEN_SECONDARY,
  CNH_LENGTH,
  CNH_NUMERIC_PATTERN,
  CNH_OFFICIAL_SOURCE_URL,
  CNH_SENATRAN_VALIDAR_URL,
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

function isValidCnhChecksum(stripped: string): boolean {
  const base = stripped.slice(0, CNH_BASE_LENGTH);
  const expected = computeCnhCheckDigits(base);
  return stripped.slice(CNH_BASE_LENGTH) === expected;
}

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'CNH input is empty');
  }

  const withoutMask = input.replace(/[.\s-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'CNH contains invalid characters');
  }

  if (stripped.length !== CNH_LENGTH) {
    return failure('INVALID_LENGTH', `CNH must have ${CNH_LENGTH} digits after normalization`);
  }

  if (hasRepeatedDigits(stripped)) {
    return failure('KNOWN_INVALID_PATTERN', 'CNH with all identical digits is invalid');
  }

  return null;
}

export function isValidCnh(input: string): boolean {
  return validateCnh(input).ok;
}

export function validateCnh(input: string): ValidationResult<Cnh> {
  const stripped = stripCnh(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  if (isValidCnhChecksum(stripped)) {
    return { ok: true, value: brandCnh(stripped), format: 'numeric' };
  }

  return failure('INVALID_CHECK_DIGIT', 'CNH check digits are invalid');
}
