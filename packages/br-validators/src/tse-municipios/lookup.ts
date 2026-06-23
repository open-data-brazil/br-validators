/**
 * TSE ↔ IBGE municipality cross-walk — offline embedded data from official TSE open data.
 * @see docs/OFFICIAL-SOURCES.md#tse-municipios
 */

import mapeamentoData from './data/mapeamento.json';
import type { TseMunicipioMapping } from './types.js';

const mapeamento: readonly TseMunicipioMapping[] = mapeamentoData;

function normalizeCodigoTse(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(5, '0');
}

export function getMapeamentoTseIbge(): readonly TseMunicipioMapping[] {
  return mapeamento;
}

export function getMunicipioIbgePorCodigoTse(codigo: string): number | undefined {
  const normalized = normalizeCodigoTse(codigo);
  if (normalized.length !== 5) {
    return undefined;
  }
  return mapeamento.find((entry) => entry.codigoTse === normalized)?.ibgeCodigo;
}

export function getCodigosTsePorMunicipio(ibgeCodigo: number): readonly string[] {
  if (!Number.isInteger(ibgeCodigo) || ibgeCodigo <= 0) {
    return [];
  }
  return mapeamento
    .filter((entry) => entry.ibgeCodigo === ibgeCodigo)
    .map((entry) => entry.codigoTse);
}
