/**
 * Rio de Janeiro RG — IFP-RJ modulo 10 alternating (Ghiorzi).
 */
import { RG_UF_RULES } from './constants.js';
import { computeRgMod10AlternatingCheckDigit } from './modulo-rg.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'RJ' as const;
const RULES = RG_UF_RULES.RJ;

export function stripRgRj(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgRj(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'RJ RG contains invalid characters');
  }

  const canonical = stripRgRj(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `RJ RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  const base = canonical.slice(0, RULES.baseLength);
  const expected = computeRgMod10AlternatingCheckDigit(base);
  if (canonical.charAt(RULES.baseLength) !== expected) {
    return rgFailure(UF, 'INVALID_CHECK_DIGIT', 'RJ RG check digit is invalid');
  }

  return rgSuccess(canonical, UF, 'rg', true);
}
