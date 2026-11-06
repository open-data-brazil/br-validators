/**
 * Minas Gerais RG — MaSP modulo 10 alternating (Ghiorzi); optional M prefix.
 */
import { RG_UF_RULES } from './constants.js';
import { computeRgMod10AlternatingCheckDigit } from './modulo-rg.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'MG' as const;
const RULES = RG_UF_RULES.MG;
const MG_CHAR_PATTERN = /^[Mm0-9.\-\s]+$/;

export function stripRgMg(input: string): string {
  const withoutSeparators = input.replace(/[.\-\s]/g, '');
  const upper = withoutSeparators.toUpperCase();
  if (upper.startsWith('M')) {
    return `M${upper.slice(1).replace(/\D/g, '')}`;
  }
  return upper.replace(/\D/g, '');
}

export function validateRgMg(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!MG_CHAR_PATTERN.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'MG RG contains invalid characters');
  }

  const hasPrefix = /^[Mm]/.test(trimmed.replace(/[.\-\s]/g, ''));
  const stripped = stripRgMg(trimmed);
  const digits = hasPrefix ? stripped.slice(1) : stripped;
  if (digits.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `MG RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  const base = digits.slice(0, RULES.baseLength);
  const expected = computeRgMod10AlternatingCheckDigit(base);
  if (digits.charAt(RULES.baseLength) !== expected) {
    return rgFailure(UF, 'INVALID_CHECK_DIGIT', 'MG RG check digit is invalid');
  }

  const branded = hasPrefix ? `M${digits}` : digits;
  return rgSuccess(branded, UF, 'rg', true);
}
