/**
 * Santa Catarina RG — format-only (9 digits; legacy SSP-SC numbering).
 * @see https://www.ciasc.sc.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'SC' as const;
const RULES = RG_UF_RULES.SC;

export function stripRgSc(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgSc(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'SC RG contains invalid characters');
  }

  const canonical = stripRgSc(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `SC RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
