/**
 * Credit card PAN validation — Luhn / ISO/IEC 7812-1 Annex B.
 * @see docs/use-cases/UC-008-validate-cartao-credito.md
 */
import { stripCartaoCredito } from '../../strip/cartao-credito.js';
import type { CartaoCreditoValidationResult } from '../../types/validation-result.js';
import { brandCartaoCredito } from '../../types/validation-result.js';
import { detectCardBrand } from './detect-brand.js';
import { CARTAO_PAN_MAX_LENGTH, CARTAO_PAN_MIN_LENGTH } from './constants.js';
import { passesLuhn } from './luhn.js';

export {
  CARTAO_GOLDEN_AMEX,
  CARTAO_GOLDEN_LUHN_WALKTHROUGH,
  CARTAO_GOLDEN_MASTERCARD,
  CARTAO_GOLDEN_MIN_LENGTH,
  CARTAO_GOLDEN_VISA,
  CARTAO_GOLDEN_VISA_MASKED,
  CARTAO_IEC_SOURCE_URL,
  CARTAO_OFFICIAL_SOURCE_URL,
  CARTAO_PAN_MAX_LENGTH,
  CARTAO_PAN_MIN_LENGTH,
} from './constants.js';
export type { CardBrand } from './constants.js';
export { detectCardBrand } from './detect-brand.js';
export { computeLuhnSum, passesLuhn } from './luhn.js';
export { applyCartaoCreditoMask } from './mask.js';

type FailedResult = Extract<CartaoCreditoValidationResult, { ok: false }>;

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

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'Credit card PAN input is empty');
  }

  const withoutMask = input.replace(/[\s-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'Credit card PAN contains invalid characters');
  }

  if (stripped.length < CARTAO_PAN_MIN_LENGTH || stripped.length > CARTAO_PAN_MAX_LENGTH) {
    return failure(
      'INVALID_LENGTH',
      `Credit card PAN must have between ${CARTAO_PAN_MIN_LENGTH} and ${CARTAO_PAN_MAX_LENGTH} digits after normalization`,
    );
  }

  if (hasRepeatedDigits(stripped)) {
    return failure('KNOWN_INVALID_PATTERN', 'Credit card PAN with all identical digits is invalid');
  }

  return null;
}

export function isValidLuhn(input: string): boolean {
  const stripped = stripCartaoCredito(input);
  if (stripped.length < CARTAO_PAN_MIN_LENGTH || stripped.length > CARTAO_PAN_MAX_LENGTH) {
    return false;
  }
  const withoutMask = input.replace(/[\s-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return false;
  }
  return passesLuhn(stripped);
}

export function isValidCartaoCredito(input: string): boolean {
  return validateCartaoCredito(input).ok;
}

export function validateCartaoCredito(input: string): CartaoCreditoValidationResult {
  const stripped = stripCartaoCredito(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  if (!passesLuhn(stripped)) {
    return failure('INVALID_CHECK_DIGIT', 'Credit card PAN check digit is invalid');
  }

  const brand = detectCardBrand(stripped);
  return {
    ok: true,
    value: brandCartaoCredito(stripped),
    format: 'cartao-credito',
    brand,
  };
}
