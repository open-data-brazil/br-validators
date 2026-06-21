/**
 * Mato Grosso IE validation — CCE/MT 9-digit + legacy 11-digit SINTEGRA pad.
 * @see BR-IE-MT-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { brandInscricaoEstadual } from '../../types/validation-result.js';
import {
  IE_MT_CANONICAL_LENGTH,
  IE_MT_LEGACY_LENGTH,
  IE_MT_PREFIX,
} from './constants.js';
import { computeIeMtCheckDigit } from './modulo-ie.js';

type FailedResult = Extract<InscricaoEstadualValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, uf: 'MT' };
}

export function stripIeMt(input: string): string {
  return input.replace(/\D/g, '');
}

export function normalizeMtToCanonical(padded11: string): string {
  const trimmed = padded11.replace(/^0+/, '');
  return trimmed.length === IE_MT_CANONICAL_LENGTH ? trimmed : padded11.slice(-IE_MT_CANONICAL_LENGTH);
}

export function padMtLegacy(stripped: string): string | null {
  if (stripped.length < IE_MT_CANONICAL_LENGTH || stripped.length > IE_MT_LEGACY_LENGTH) {
    return null;
  }
  return stripped.padStart(IE_MT_LEGACY_LENGTH, '0');
}

export function validateIeMt(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Inscrição Estadual input is empty', uf: 'MT' };
  }

  if (/[^0-9.\-\s]/.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'MT Inscrição Estadual contains invalid characters');
  }

  const stripped = stripIeMt(trimmed);
  if (stripped.length < IE_MT_CANONICAL_LENGTH || stripped.length > IE_MT_LEGACY_LENGTH) {
    return failure(
      'INVALID_LENGTH',
      `MT Inscrição Estadual must have ${IE_MT_CANONICAL_LENGTH} or ${IE_MT_LEGACY_LENGTH} digits after normalization`,
    );
  }

  const padded =
    stripped.length === IE_MT_LEGACY_LENGTH ? stripped : stripped.padStart(IE_MT_LEGACY_LENGTH, '0');
  const canonical = normalizeMtToCanonical(padded);
  if (!canonical.startsWith(IE_MT_PREFIX)) {
    return failure('UNSUPPORTED_FORMAT', 'MT Inscrição Estadual must start with prefix 13');
  }

  const expectedDv = computeIeMtCheckDigit(padded.slice(0, 10));
  if (Number(padded.charAt(10)) !== expectedDv) {
    return failure('INVALID_CHECK_DIGIT', 'MT Inscrição Estadual check digit is invalid');
  }

  return {
    ok: true,
    value: brandInscricaoEstadual(canonical),
    uf: 'MT',
    format: 'inscricao-estadual',
  };
}
