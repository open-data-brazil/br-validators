/**
 * Distrito Federal IE validation — CF/DF 13 digits, dual modulo-11 DVs.
 * @see BR-IE-DF-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { brandInscricaoEstadual } from '../../types/validation-result.js';
import { IE_DF_DV1_WEIGHTS, IE_DF_DV2_WEIGHTS, IE_DF_LENGTH, IE_DF_PREFIX } from './constants.js';
import { computeIeDfCheckDigit } from './modulo-ie.js';

type FailedResult = Extract<InscricaoEstadualValidationResult, { ok: false }>;

const DF_MASK_PATTERN = /^[0-9.-]+$/;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, uf: 'DF' };
}

export function stripIeDf(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateIeDf(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Inscrição Estadual input is empty', uf: 'DF' };
  }

  if (!DF_MASK_PATTERN.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'DF Inscrição Estadual contains invalid characters');
  }

  const stripped = stripIeDf(trimmed);
  if (stripped.length === 12) {
    return failure('INVALID_LENGTH', 'DF Inscrição Estadual legacy 12-digit format is not supported; use 13 digits');
  }

  if (stripped.length !== IE_DF_LENGTH) {
    return failure('INVALID_LENGTH', `DF Inscrição Estadual must have ${IE_DF_LENGTH} digits after normalization`);
  }

  if (!stripped.startsWith(IE_DF_PREFIX)) {
    return failure('UNSUPPORTED_FORMAT', 'DF Inscrição Estadual must start with prefix 07');
  }

  const dv1 = computeIeDfCheckDigit(stripped.slice(0, 11), IE_DF_DV1_WEIGHTS);
  const dv2 = computeIeDfCheckDigit(stripped.slice(0, 11), IE_DF_DV2_WEIGHTS, true, dv1);

  if (Number(stripped.charAt(11)) !== dv1 || Number(stripped.charAt(12)) !== dv2) {
    return failure('INVALID_CHECK_DIGIT', 'DF Inscrição Estadual check digits are invalid');
  }

  return {
    ok: true,
    value: brandInscricaoEstadual(stripped),
    uf: 'DF',
    format: 'inscricao-estadual',
  };
}
