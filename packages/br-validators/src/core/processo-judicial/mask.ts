import { PROCESSO_JUDICIAL_LENGTH, PROCESSO_JUDICIAL_NUMERIC_PATTERN } from './constants.js';

/**
 * Official display mask — NNNNNNN-DD.AAAA.J.TR.OOOO (Resolução 65/2008).
 */
export function applyProcessoJudicialMask(canonical: string): string {
  if (!PROCESSO_JUDICIAL_NUMERIC_PATTERN.test(canonical)) {
    throw new Error(`Processo judicial must have exactly ${PROCESSO_JUDICIAL_LENGTH} digits to format`);
  }

  return `${canonical.slice(0, 7)}-${canonical.slice(7, 9)}.${canonical.slice(9, 13)}.${canonical.slice(13, 14)}.${canonical.slice(14, 16)}.${canonical.slice(16, 20)}`;
}
