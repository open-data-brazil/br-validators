import { CNH_LENGTH, CNH_NUMERIC_PATTERN } from './constants.js';

/**
 * Official system format — 11 contiguous digits (BR-CNH-005).
 * Unlike CPF, CONTRAN/SENATRAN systems do not use dot/dash decoration.
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf
 * @see https://www.gov.br/pt-br/servicos/validar-cnh
 */
export function applyCnhCanonicalFormat(canonical: string): string {
  if (!CNH_NUMERIC_PATTERN.test(canonical)) {
    throw new Error(`CNH must have exactly ${CNH_LENGTH} digits to format`);
  }
  return canonical;
}
