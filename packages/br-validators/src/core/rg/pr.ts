/**
 * Paraná RG — format-only (8 digits, no published DV algorithm).
 * @see https://www.iipar.pr.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'PR' as const;
const RULES = RG_UF_RULES.PR;

export function stripRgPr(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgPr(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'PR RG contains invalid characters');
  }

  const canonical = stripRgPr(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `PR RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
