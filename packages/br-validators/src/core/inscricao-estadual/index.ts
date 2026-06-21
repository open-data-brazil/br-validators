/**
 * Inscrição Estadual validation — per-UF algorithms (Phase 8 v1: SP, MT, DF).
 * @see docs/use-cases/UC-009-validate-inscricao-estadual.md
 */
import type { FormatResult, InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import {
  IE_DF_OFFICIAL_SOURCE_URL,
  IE_MT_OFFICIAL_SOURCE_URL,
  IE_SP_OFFICIAL_SOURCE_URL,
  IE_SUPPORTED_UFS,
  type UfCode,
} from './constants.js';
import { validateIeDf } from './df.js';
import { applyIeDfMask, applyIeSpMask } from './mask.js';
import { validateIeMt } from './mt.js';
import { validateIeSp } from './sp.js';

export {
  IE_DF_GOLDEN,
  IE_DF_GOLDEN_MASKED,
  IE_DF_LENGTH,
  IE_DF_OFFICIAL_SOURCE_URL,
  IE_DF_PREFIX,
  IE_MT_CANONICAL_LENGTH,
  IE_MT_GOLDEN_CANONICAL,
  IE_MT_GOLDEN_LEGACY,
  IE_MT_LEGACY_LENGTH,
  IE_MT_OFFICIAL_SOURCE_URL,
  IE_MT_PREFIX,
  IE_OFFICIAL_SOURCE_URL,
  IE_SP_GOLDEN,
  IE_SP_GOLDEN_MASKED,
  IE_SP_LENGTH,
  IE_SP_OFFICIAL_SOURCE_URL,
  IE_SUPPORTED_UFS,
} from './constants.js';
export type { UfCode } from './constants.js';
export { stripIeDf, validateIeDf } from './df.js';
export { normalizeMtToCanonical, padMtLegacy, stripIeMt, validateIeMt } from './mt.js';
export { stripIeSp, validateIeSp } from './sp.js';
export { applyIeDfMask, applyIeSpMask } from './mask.js';

export type ValidateInscricaoEstadualOptions = {
  uf: UfCode;
};

type FailedResult = Extract<InscricaoEstadualValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

export function getIeOfficialSourceUrl(uf: UfCode): string {
  if (uf === 'SP') {
    return IE_SP_OFFICIAL_SOURCE_URL;
  }
  if (uf === 'MT') {
    return IE_MT_OFFICIAL_SOURCE_URL;
  }
  return IE_DF_OFFICIAL_SOURCE_URL;
}

function isSupportedUf(uf: string | undefined): uf is UfCode {
  return uf !== undefined && (IE_SUPPORTED_UFS as readonly string[]).includes(uf);
}

function validateByUf(input: string, uf: UfCode): InscricaoEstadualValidationResult {
  if (uf === 'SP') {
    return validateIeSp(input);
  }
  if (uf === 'MT') {
    return validateIeMt(input);
  }
  return validateIeDf(input);
}

export function stripInscricaoEstadual(input: string): string {
  return input.replace(/\D/g, '');
}

export function isValidInscricaoEstadual(
  input: string,
  options: ValidateInscricaoEstadualOptions,
): boolean {
  return validateInscricaoEstadual(input, options).ok;
}

export function validateInscricaoEstadual(
  input: string,
  options: ValidateInscricaoEstadualOptions,
): InscricaoEstadualValidationResult {
  if (!isSupportedUf(options.uf)) {
    return failure('UNSUPPORTED_FORMAT', `UF ${String(options.uf)} is not supported in v1`);
  }
  return validateByUf(input, options.uf);
}

export function formatInscricaoEstadual(
  input: string,
  options: ValidateInscricaoEstadualOptions,
): FormatResult {
  const result = validateInscricaoEstadual(input, options);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  try {
    if (result.uf === 'SP') {
      return { ok: true, formatted: applyIeSpMask(result.value) };
    }
    if (result.uf === 'DF') {
      return { ok: true, formatted: applyIeDfMask(result.value) };
    }
    return { ok: true, formatted: result.value };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to format Inscrição Estadual';
    return { ok: false, code: 'UNSUPPORTED_FORMAT', message };
  }
}
