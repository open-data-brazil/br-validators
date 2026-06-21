/**
 * License plate — legacy format LLLNNNN (CONTRAN).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
 */
import { stripPlaca } from '../../strip/index.js';
import { PLACA_LEGACY_PATTERN } from './constants.js';

export function isValidPlacaLegacy(input: string): boolean {
  const stripped = stripPlaca(input);
  return PLACA_LEGACY_PATTERN.test(stripped);
}
