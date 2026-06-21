/**
 * License plate — Mercosul format LLLNLNN (CONTRAN).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
 */
import { stripPlaca } from '../../strip/index.js';
import { PLACA_MERCOSUL_PATTERN } from './constants.js';

export function isValidPlacaMercosul(input: string): boolean {
  const stripped = stripPlaca(input);
  return PLACA_MERCOSUL_PATTERN.test(stripped);
}
