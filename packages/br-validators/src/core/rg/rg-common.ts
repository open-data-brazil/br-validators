import type { DocumentFormat } from '../../types/validation-result.js';
import { brandRg } from '../../types/validation-result.js';
import type { RgUfCode } from '../../types/validation-result.js';
import type { RgValidationResult } from './types.js';

export type RgFailedResult = Extract<RgValidationResult, { ok: false }>;

export function rgFailure(uf: RgUfCode, code: RgFailedResult['code'], message: string): RgFailedResult {
  return { ok: false, code, message, uf };
}

export function rgSuccess(
  canonical: string,
  uf: RgUfCode,
  format: DocumentFormat,
  checkDigitValidated: boolean,
): Extract<RgValidationResult, { ok: true }> {
  return {
    ok: true,
    value: brandRg(canonical),
    uf,
    format,
    checkDigitValidated,
  };
}

export function checkRgTrimmedEmpty(trimmed: string, uf: RgUfCode): RgFailedResult | null {
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'RG input is empty', uf };
  }
  return null;
}

export function normalizeRgCheckDigit(digit: string): string {
  return digit.toUpperCase();
}

export function matchesRgCheckDigit(expected: string, actual: string): boolean {
  return normalizeRgCheckDigit(expected) === normalizeRgCheckDigit(actual);
}
