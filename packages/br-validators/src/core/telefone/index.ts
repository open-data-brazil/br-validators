/**
 * Brazilian telephone validation — Anatel DDD + fixo/celular structure.
 * @see https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro
 * @see https://www.gov.br/anatel/pt-br/regulado/numeracao/nono-digito
 */
import { normalizeTelefoneDigits } from '../../strip/telefone.js';
import type { TelefoneTipo, TelefoneValidationResult } from '../../types/validation-result.js';
import { brandTelefone } from '../../types/validation-result.js';
import {
  ANATEL_DDD_SET,
  TELEFONE_DDD_LENGTH,
  TELEFONE_EMERGENCY_CODES,
} from './constants.js';

export {
  ANATEL_DDDS,
  ANATEL_DDD_SET,
  TELEFONE_ANATEL_DDD_PANEL_URL,
  TELEFONE_GOLDEN_CELULAR,
  TELEFONE_GOLDEN_CELULAR_MASKED,
  TELEFONE_GOLDEN_FIXO,
  TELEFONE_GOLDEN_FIXO_MASKED,
  TELEFONE_OFFICIAL_SOURCE_URL,
} from './constants.js';
export { getDddInfo } from './ddd-lookup.js';
export { TELEFONE_DDD_DATA_VERSION } from './ddd-version.js';
export type { DddInfo, TelefoneDddDataVersion } from './ddd-types.js';

type FailedResult = Extract<TelefoneValidationResult, { ok: false }>;

const MASK_CHARS_PATTERN = /[\s().+-]/g;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function hasInvalidCharacters(input: string): boolean {
  const withoutMask = input.replace(MASK_CHARS_PATTERN, '');
  return /[^0-9]/.test(withoutMask);
}

function detectTipo(local: string): TelefoneTipo | null {
  if (local.length === 9 && local[0] === '9') {
    return 'celular';
  }
  if (local.length === 8 && /^[2345]/.test(local)) {
    return 'fixo';
  }
  return null;
}

function rejectLocalPattern(local: string, nationalLength: number): FailedResult {
  if (nationalLength === 11) {
    return failure(
      'KNOWN_INVALID_PATTERN',
      'Mobile numbers must have 9 digits starting with 9 after DDD (Anatel nono dígito)',
    );
  }

  if (nationalLength === 10 && /^[6789]/.test(local)) {
    return failure(
      'KNOWN_INVALID_PATTERN',
      'Mobile numbers require 9 digits starting with 9; numbers starting with 6–9 without the 9th digit are invalid',
    );
  }

  return failure(
    'KNOWN_INVALID_PATTERN',
    'Landline numbers must have 8 digits starting with 2, 3, 4, or 5 after DDD',
  );
}

function validateStructure(
  input: string,
  normalized: string,
): FailedResult | { tipo: TelefoneTipo } {
  if (input.trim().length === 0) {
    return failure('EMPTY_INPUT', 'Telephone input is empty');
  }

  if (hasInvalidCharacters(input)) {
    return failure('INVALID_CHARACTER', 'Telephone contains invalid characters');
  }

  if (normalized.length === 0) {
    return failure('EMPTY_INPUT', 'Telephone input is empty');
  }

  if (TELEFONE_EMERGENCY_CODES.has(normalized)) {
    return failure('UNSUPPORTED_FORMAT', 'Emergency short codes are not subscriber telephone numbers');
  }

  if (normalized.length !== 10 && normalized.length !== 11) {
    return failure(
      'INVALID_LENGTH',
      'Telephone must have 10 digits (fixo) or 11 digits (celular) after normalization',
    );
  }

  const ddd = normalized.slice(0, TELEFONE_DDD_LENGTH);
  if (!ANATEL_DDD_SET.has(ddd)) {
    return failure('KNOWN_INVALID_PATTERN', `Area code ${ddd} is not a valid Anatel DDD`);
  }

  const local = normalized.slice(TELEFONE_DDD_LENGTH);
  const tipo = detectTipo(local);
  if (!tipo) {
    return rejectLocalPattern(local, normalized.length);
  }

  return { tipo };
}

export function isValidTelefone(input: string): boolean {
  return validateTelefone(input).ok;
}

export function validateTelefone(input: string): TelefoneValidationResult {
  const normalized = normalizeTelefoneDigits(input);
  const structural = validateStructure(input, normalized);
  if ('ok' in structural) {
    return structural;
  }

  return {
    ok: true,
    value: brandTelefone(normalized),
    tipo: structural.tipo,
    format: 'telefone',
  };
}
