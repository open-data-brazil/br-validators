/**
 * São Paulo RG — SSP-SP modulo 11 (Ghiorzi).
 */
import { RG_UF_RULES } from './constants.js';
import { computeRgSpCheckDigit } from './modulo-rg.js';
import {
  checkRgTrimmedEmpty,
  matchesRgCheckDigit,
  rgFailure,
  rgSuccess,
} from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'SP' as const;
const RULES = RG_UF_RULES.SP;
const SP_CHAR_PATTERN = /^[0-9.\-\sXx]+$/;

export function stripRgSp(input: string): string {
  return input.replace(/[.\-\s]/g, '').toUpperCase();
}

export function validateRgSp(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!SP_CHAR_PATTERN.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'SP RG contains invalid characters');
  }

  const canonical = stripRgSp(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `SP RG must have ${RULES.canonicalLength} characters after normalization`,
    );
  }

  const base = canonical.slice(0, RULES.baseLength);
  if (!/^\d{8}$/.test(base)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'SP RG base must be 8 digits');
  }

  const expected = computeRgSpCheckDigit(base);
  const actual = canonical.charAt(RULES.baseLength);
  if (!matchesRgCheckDigit(expected, actual)) {
    return rgFailure(UF, 'INVALID_CHECK_DIGIT', 'SP RG check digit is invalid');
  }

  return rgSuccess(canonical, UF, 'rg', true);
}
