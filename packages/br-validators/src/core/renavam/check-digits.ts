/**
 * RENAVAM check digit — modulo 11, peso 9 (Portaria DENATRAN 27/2013).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf
 * @see https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-renavam/ — algorithm cross-check (AdvPL)
 */
import { weightedSum } from '../cnpj/modulo11.js';
import { RENAVAM_DV_WEIGHTS } from './constants.js';

function digitValue(char: string): number {
  return Number(char);
}

export function computeRenavamWeightedSum(base: string): number {
  const values = base.split('').map(digitValue);
  return weightedSum(values, RENAVAM_DV_WEIGHTS);
}

export function computeRenavamCheckDigit(base: string): number {
  const remainder = computeRenavamWeightedSum(base) % 11;
  let dv = 11 - remainder;
  if (dv > 9) {
    dv = 0;
  }
  return dv;
}
