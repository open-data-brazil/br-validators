/**
 * CONFAZ CFOP lookup — offline embedded data from official SINIEF publication.
 * @see https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente
 */

import cfopData from './data/cfop.json';
import type { Cfop } from './types.js';

const cfops: readonly Cfop[] = cfopData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\./g, '').replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(4, '0').slice(-4);
}

export function getCfops(): readonly Cfop[] {
  return cfops;
}

export function getCfopPorCodigo(codigo: string): Cfop | undefined {
  const normalized = normalizeCodigo(codigo);
  if (normalized.length !== 4) {
    return undefined;
  }
  return cfops.find((cfop) => cfop.codigo === normalized);
}

export function searchCfop(query: string, options?: { limit?: number }): readonly Cfop[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Cfop[] = [];

  for (const cfop of cfops) {
    if (cfop.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(cfop);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
