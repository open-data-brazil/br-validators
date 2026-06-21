/**
 * Modulo 11 check digit — RFB Q14 remainder rule.
 * @see https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf
 */
export function modulo11CheckDigit(sum: number): number {
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function weightedSum(values: number[], weights: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += values[i] * weights[i];
  }
  return sum;
}

export function computeCheckDigit(chars: string, weights: readonly number[], valueFn: (c: string) => number): number {
  const values: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    values.push(valueFn(chars.charAt(i)));
  }
  return modulo11CheckDigit(weightedSum(values, weights));
}
