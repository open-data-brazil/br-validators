/**
 * Linha digitável validation — modulo 10 field DVs (Anexo IX).
 * @see BR-BOLETO-002, BR-BOLETO-008
 */
import type { BoletoValidationResult } from '../../types/validation-result.js';
import { brandLinhaDigitavel } from '../../types/validation-result.js';
import {
  BOLETO_CURRENCY_REAL,
  BOLETO_LINHA_LENGTH,
} from './constants.js';
import { convertLinhaToCodigoBarrasDigits } from './convert.js';
import { computeModulo10FieldDv } from './modulo10.js';
import { computeModulo11BarcodeDv } from './modulo11.js';

export { applyLinhaDigitavelMask, formatLinhaDigitavel } from './mask.js';

type FailedResult = Extract<BoletoValidationResult, { ok: false }>;

const LINHA_MASK_PATTERN = /^[0-9.\s]+$/;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, inputKind: 'linha-digitavel' };
}

export function stripLinhaDigitavel(input: string): string {
  return input.replace(/\D/g, '');
}

function validateFieldDv(
  fieldDigits: string,
  actualDv: string,
  fieldNumber: 1 | 2 | 3,
): FailedResult | null {
  const expected = String(computeModulo10FieldDv(fieldDigits));
  if (actualDv !== expected) {
    return failure('INVALID_CHECK_DIGIT', `Linha digitável field ${fieldNumber} check digit is invalid`);
  }
  return null;
}

export function validateLinhaDigitavel(input: string): BoletoValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Linha digitável input is empty' };
  }

  if (!LINHA_MASK_PATTERN.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'Linha digitável contains invalid characters');
  }

  const stripped = stripLinhaDigitavel(trimmed);
  if (stripped.length !== BOLETO_LINHA_LENGTH) {
    return failure('INVALID_LENGTH', `Linha digitável must have ${BOLETO_LINHA_LENGTH} digits after normalization`);
  }

  if (stripped.charAt(3) !== BOLETO_CURRENCY_REAL) {
    return failure('UNSUPPORTED_FORMAT', 'Bank boleto currency code must be 9 (Real)');
  }

  const field1Error = validateFieldDv(stripped.slice(0, 9), stripped.charAt(9), 1);
  if (field1Error) {
    return field1Error;
  }

  const field2Error = validateFieldDv(stripped.slice(10, 20), stripped.charAt(20), 2);
  if (field2Error) {
    return field2Error;
  }

  const field3Error = validateFieldDv(stripped.slice(21, 31), stripped.charAt(31), 3);
  if (field3Error) {
    return field3Error;
  }

  const barcode = convertLinhaToCodigoBarrasDigits(stripped);
  const barcodeDvFromMod11 = String(
    computeModulo11BarcodeDv(barcode.slice(0, 4) + barcode.slice(5)),
  );

  if (stripped.charAt(32) !== barcodeDvFromMod11) {
    return failure('INVALID_CHECK_DIGIT', 'Linha digitável field 4 (barcode DV) is invalid');
  }

  return {
    ok: true,
    value: brandLinhaDigitavel(stripped),
    inputKind: 'linha-digitavel',
    format: 'linha-digitavel',
  };
}
