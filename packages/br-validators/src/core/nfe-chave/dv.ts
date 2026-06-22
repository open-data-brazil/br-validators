/**
 * NF-e chave de acesso DV — modulo 11, weights 2..9 right-to-left (MOC §2.2.6.2).
 * @see http://moc.sped.fazenda.pr.gov.br/#2.2.6.2. Cálculo do Dígito Verificador da Chave de Acesso da NF-e
 */
import { NFE_CHAVE_BASE_LENGTH } from './constants.js';

export function computeNfeChaveWeightedSum(base43: string): number {
  let multiplier = 2;
  let sum = 0;

  for (let i = base43.length - 1; i >= 0; i--) {
    sum += Number(base43[i]) * multiplier;
    multiplier = multiplier >= 9 ? 2 : multiplier + 1;
  }

  return sum;
}

export function resolveNfeChaveCheckDigit(weightedSum: number): number {
  const remainder = weightedSum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Compute DV for the first 43 digits of a chave de acesso. */
export function computeNfeChaveCheckDigit(base43: string): number {
  if (base43.length !== NFE_CHAVE_BASE_LENGTH) {
    throw new Error(`NF-e chave base must have exactly ${NFE_CHAVE_BASE_LENGTH} digits`);
  }
  return resolveNfeChaveCheckDigit(computeNfeChaveWeightedSum(base43));
}

export function isValidNfeChaveCheckDigit(stripped: string): boolean {
  const base = stripped.slice(0, NFE_CHAVE_BASE_LENGTH);
  const expected = String(computeNfeChaveCheckDigit(base));
  return stripped[NFE_CHAVE_BASE_LENGTH] === expected;
}
