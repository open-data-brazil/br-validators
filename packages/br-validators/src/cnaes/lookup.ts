/**
 * IBGE CNAE 2.3 subclass lookup — offline embedded data from official IBGE API.
 * @see https://servicodados.ibge.gov.br/api/docs/cnae
 */

import cnaesData from './data/cnaes.json';
import type { Cnae } from './types.js';

const cnaes: readonly Cnae[] = cnaesData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(7, '0').slice(-7);
}

export function getCnaes(): readonly Cnae[] {
  return cnaes;
}

export function getCnaePorCodigo(codigo: string): Cnae | undefined {
  const normalized = normalizeCodigo(codigo);
  if (normalized.length !== 7) {
    return undefined;
  }
  return cnaes.find((cnae) => cnae.codigo === normalized);
}

export function searchCnaes(query: string, options?: { limit?: number }): readonly Cnae[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Cnae[] = [];

  for (const cnae of cnaes) {
    if (cnae.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(cnae);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
