/**
 * Best-effort card brand from IIN prefix — non-authoritative (BR-LUHN-005).
 */
import type { CardBrand } from './constants.js';
import { ELO_IIN_PREFIXES, HIPERCARD_IIN_PREFIXES } from './constants.js';

export type { CardBrand };

export function detectCardBrand(strippedPan: string): CardBrand {
  for (const prefix of ELO_IIN_PREFIXES) {
    if (strippedPan.startsWith(prefix)) {
      return 'elo';
    }
  }

  for (const prefix of HIPERCARD_IIN_PREFIXES) {
    if (strippedPan.startsWith(prefix)) {
      return 'hipercard';
    }
  }

  if (/^3[47]/.test(strippedPan)) {
    return 'amex';
  }

  if (/^5[1-5]/.test(strippedPan) || /^2[2-7]/.test(strippedPan)) {
    return 'mastercard';
  }

  if (strippedPan.startsWith('4')) {
    return 'visa';
  }

  return 'unknown';
}
