import {
  TELEFONE_CELULAR_MASK_PATTERN,
  TELEFONE_FIXO_MASK_PATTERN,
} from './constants.js';
import type { TelefoneTipo } from '../../types/validation-result.js';

/** Mask (DD) 9XXXX-XXXX or (DD) XXXX-XXXX per Anatel E.164 layout. */
export function applyTelefoneMask(canonical: string, tipo: TelefoneTipo): string {
  const pattern = tipo === 'celular' ? TELEFONE_CELULAR_MASK_PATTERN : TELEFONE_FIXO_MASK_PATTERN;
  const match = pattern.exec(canonical);
  if (!match) {
    throw new Error(`Telephone must have valid ${tipo} length to apply mask`);
  }
  return `(${match[1]}) ${match[2]}-${match[3]}`;
}
