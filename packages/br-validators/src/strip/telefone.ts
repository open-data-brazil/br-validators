/**
 * Strip and normalize Brazilian telephone numbers (BR-TEL-001).
 * @see https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro
 */
import { TELEFONE_COUNTRY_CODE } from '../core/telefone/constants.js';

/** Digits only from input (no country/trunk normalization). */
export function extractTelefoneDigits(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * National canonical form: DDD + local digits (10 or 11 digits).
 * Strips +55 country code and leading domestic trunk `0` when present.
 */
export function normalizeTelefoneDigits(input: string): string {
  let digits = extractTelefoneDigits(input);
  if (digits.length === 0) {
    return '';
  }

  if (digits.startsWith(TELEFONE_COUNTRY_CODE) && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(TELEFONE_COUNTRY_CODE.length);
  }

  if (digits.startsWith('0') && (digits.length === 11 || digits.length === 12)) {
    digits = digits.slice(1);
  }

  return digits;
}

/** @see normalizeTelefoneDigits */
export function stripTelefone(input: string): string {
  return normalizeTelefoneDigits(input);
}
