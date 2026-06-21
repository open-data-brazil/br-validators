/**
 * License plate format detection — legacy vs Mercosul (CONTRAN).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
 */
import { stripPlaca } from '../../strip/index.js';
import { PLACA_LENGTH, PLACA_LEGACY_PATTERN, PLACA_MERCOSUL_PATTERN } from './constants.js';

export type PlacaFormat = 'legacy' | 'mercosul' | 'unknown';

export function detectPlacaFormat(input: string): PlacaFormat {
  const stripped = stripPlaca(input);
  if (stripped.length !== PLACA_LENGTH) {
    return 'unknown';
  }
  if (PLACA_LEGACY_PATTERN.test(stripped)) {
    return 'legacy';
  }
  if (PLACA_MERCOSUL_PATTERN.test(stripped)) {
    return 'mercosul';
  }
  return 'unknown';
}
