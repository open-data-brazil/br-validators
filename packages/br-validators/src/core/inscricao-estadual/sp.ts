/**
 * São Paulo IE validation — dual modulo-11 DVs (SEFAZ 2012).
 * @see BR-IE-SP-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { brandInscricaoEstadual } from '../../types/validation-result.js';
import { IE_SP_DV1_WEIGHTS, IE_SP_DV2_WEIGHTS, IE_SP_LENGTH } from './constants.js';
import { computeIeSpCheckDigit } from './modulo-ie.js';

type FailedResult = Extract<InscricaoEstadualValidationResult, { ok: false }>;

const SP_MASK_PATTERN = /^[0-9.]+$/;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, uf: 'SP' };
}

export function stripIeSp(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateIeSp(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Inscrição Estadual input is empty', uf: 'SP' };
  }

  if (/[Pp]/.test(trimmed)) {
    return failure('UNSUPPORTED_FORMAT', 'SP rural IE format (P…) requires validateIeProdutorRural');
  }

  if (!SP_MASK_PATTERN.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'SP Inscrição Estadual contains invalid characters');
  }

  const stripped = stripIeSp(trimmed);
  if (stripped.length !== IE_SP_LENGTH) {
    return failure('INVALID_LENGTH', `SP Inscrição Estadual must have ${IE_SP_LENGTH} digits after normalization`);
  }

  const dv1 = computeIeSpCheckDigit(stripped, IE_SP_DV1_WEIGHTS);
  const dv2 = computeIeSpCheckDigit(stripped, IE_SP_DV2_WEIGHTS);

  if (Number(stripped.charAt(8)) !== dv1 || Number(stripped.charAt(11)) !== dv2) {
    return failure('INVALID_CHECK_DIGIT', 'SP Inscrição Estadual check digits are invalid');
  }

  return {
    ok: true,
    value: brandInscricaoEstadual(stripped),
    uf: 'SP',
    format: 'inscricao-estadual',
  };
}
