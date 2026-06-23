/**
 * NCM lookup — offline embedded data from official Siscomex nomenclature JSON.
 * @see https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/download-ncm-nomenclatura-comum-do-mercosul
 */

import ncmData from './data/ncm.json';
import type { Ncm } from './types.js';

const ncms: readonly Ncm[] = ncmData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(8, '0').slice(-8);
}

export function getNcms(): readonly Ncm[] {
  return ncms;
}

export function getNcmPorCodigo(codigo: string): Ncm | undefined {
  const normalized = normalizeCodigo(codigo);
  if (normalized.length !== 8) {
    return undefined;
  }
  return ncms.find((ncm) => ncm.codigo === normalized);
}

export function searchNcm(query: string, options?: { limit?: number }): readonly Ncm[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Ncm[] = [];

  for (const ncm of ncms) {
    if (ncm.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(ncm);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
