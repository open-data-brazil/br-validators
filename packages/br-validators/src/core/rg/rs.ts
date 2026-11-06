/**
 * Rio Grande do Sul RG — format-only (10 digits, IGP-RS).
 * @see https://www.estado.rs.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'RS' as const;
const RULES = RG_UF_RULES.RS;

export function stripRgRs(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgRs(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s/]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'RS RG contains invalid characters');
  }

  const canonical = stripRgRs(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `RS RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
