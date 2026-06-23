/**
 * CEP prefix lookup — offline embedded data from IBGE CNEFE Censo 2022.
 * @see https://www.ibge.gov.br/estatisticas/sociais/populacao/38734-cadastro-nacional-de-enderecos-para-fins-estatisticos.html
 */

import faixasData from './data/faixas.json';
import type { CepFaixa } from './faixa-types.js';

const faixas: readonly CepFaixa[] = faixasData;

const faixaByPrefix = new Map<string, CepFaixa>(
  faixas.map((faixa) => [faixa.prefixo, faixa]),
);

function normalizePrefix(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length < 5) {
    return '';
  }
  return digits.slice(0, 5);
}

export function getCepFaixas(): readonly CepFaixa[] {
  return faixas;
}

export function getCepFaixaInfo(prefix: string): CepFaixa | undefined {
  const normalized = normalizePrefix(prefix);
  if (normalized.length !== 5) {
    return undefined;
  }
  return faixaByPrefix.get(normalized);
}
