/**
 * CBO 2002 occupation lookup — offline embedded data from official MTE CSV.
 * @see https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads
 */

import cboData from './data/cbo.json';
import type { Cbo } from './types.js';

const cbos: readonly Cbo[] = cboData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(6, '0').slice(-6);
}

export function getCbos(): readonly Cbo[] {
  return cbos;
}

export function getCboPorCodigo(codigo: string): Cbo | undefined {
  const normalized = normalizeCodigo(codigo);
  if (normalized.length !== 6) {
    return undefined;
  }
  return cbos.find((cbo) => cbo.codigo === normalized);
}

export function searchCbo(query: string, options?: { limit?: number }): readonly Cbo[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Cbo[] = [];

  for (const cbo of cbos) {
    if (cbo.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(cbo);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
