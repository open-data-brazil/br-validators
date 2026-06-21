/**
 * Linha digitável display mask — FEBRABAN Anexo IX (BR-BOLETO-008).
 * @see docs/use-cases/UC-003-format-document.md
 */
import { BOLETO_LINHA_LENGTH } from './constants.js';

/** FEBRABAN typable linha digitável mask (47 digits). */
export function applyLinhaDigitavelMask(stripped47: string): string {
  if (stripped47.length !== BOLETO_LINHA_LENGTH) {
    throw new Error(`Linha digitável must have exactly ${BOLETO_LINHA_LENGTH} digits to apply mask`);
  }
  return (
    `${stripped47.slice(0, 5)}.${stripped47.slice(5, 10)} ` +
    `${stripped47.slice(10, 15)}.${stripped47.slice(15, 21)} ` +
    `${stripped47.slice(21, 26)}.${stripped47.slice(26, 32)} ` +
    `${stripped47[32]} ${stripped47.slice(33)}`
  );
}

/** Backward-compatible alias for applyLinhaDigitavelMask. */
export function formatLinhaDigitavel(stripped: string): string {
  return applyLinhaDigitavelMask(stripped);
}
