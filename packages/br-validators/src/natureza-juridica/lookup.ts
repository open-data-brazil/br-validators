/**
 * RFB CNPJ natureza jurídica lookup — offline embedded data from official open-data CSV.
 * @see https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/
 */

import naturezasData from './data/naturezas.json';
import type { NaturezaJuridica } from './types.js';

const naturezas: readonly NaturezaJuridica[] = naturezasData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(4, '0').slice(-4);
}

export function getNaturezasJuridicas(): readonly NaturezaJuridica[] {
  return naturezas;
}

export function getNaturezaJuridicaPorCodigo(codigo: string): NaturezaJuridica | undefined {
  const normalized = normalizeCodigo(codigo);
  if (normalized.length !== 4) {
    return undefined;
  }
  return naturezas.find((natureza) => natureza.codigo === normalized);
}
