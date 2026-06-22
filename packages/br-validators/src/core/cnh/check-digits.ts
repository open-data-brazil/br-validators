/**
 * CNH check digits — modulo 11 with inter-DV discount (desconto).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf
 */
import { weightedSum } from '../cnpj/modulo11.js';
import { CNH_DV1_WEIGHTS, CNH_DV2_WEIGHTS } from './constants.js';

function digitValues(chars: string): number[] {
  const values: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    values.push(Number(chars.charAt(i)));
  }
  return values;
}

export function computeCnhFirstCheckDigit(base: string): { dv: number; discount: number } {
  const remainder = weightedSum(digitValues(base), CNH_DV1_WEIGHTS) % 11;
  if (remainder >= 10) {
    return { dv: 0, discount: 2 };
  }
  return { dv: remainder, discount: 0 };
}

export function computeCnhSecondCheckDigit(base: string, discount: number): number {
  const remainder = weightedSum(digitValues(base), CNH_DV2_WEIGHTS) % 11;
  let dv = remainder >= 10 ? 0 : remainder - discount;
  if (dv < 0) {
    dv += 11;
  }
  if (dv >= 10) {
    dv = 0;
  }
  return dv;
}

export function computeCnhCheckDigits(base: string): string {
  const { dv: dv1, discount } = computeCnhFirstCheckDigit(base);
  const dv2 = computeCnhSecondCheckDigit(base, discount);
  return `${String(dv1)}${String(dv2)}`;
}
