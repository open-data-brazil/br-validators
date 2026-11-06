import { RENAVAM_LENGTH, RENAVAM_NUMERIC_PATTERN } from './constants.js';

/**
 * Official system format — 11 contiguous digits (BR-RENAVAM-005).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf
 */
export function applyRenavamCanonicalFormat(canonical: string): string {
  if (!RENAVAM_NUMERIC_PATTERN.test(canonical)) {
    throw new Error(`RENAVAM must have exactly ${RENAVAM_LENGTH} digits to format`);
  }
  return canonical;
}
