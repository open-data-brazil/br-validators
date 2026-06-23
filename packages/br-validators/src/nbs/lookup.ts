/**
 * NFSe NBS lookup — offline embedded data from official Anexo B xlsx.
 * @see https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx
 */

import nbsData from './data/nbs.json';
import type { Nbs } from './types.js';

const nbsList: readonly Nbs[] = nbsData;

const LEAF_CODE_PATTERN = /^\d\.\d{4}\.\d{2}\.\d{2}$/;

function normalizeCodigo(codigo: string): string {
  const trimmed = codigo.trim();
  if (LEAF_CODE_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 9) {
    return '';
  }

  return `${digits[0]}.${digits.slice(1, 5)}.${digits.slice(5, 7)}.${digits.slice(7, 9)}`;
}

export function getNbsList(): readonly Nbs[] {
  return nbsList;
}

export function getNbsPorCodigo(codigo: string): Nbs | undefined {
  const normalized = normalizeCodigo(codigo);
  if (!LEAF_CODE_PATTERN.test(normalized)) {
    return undefined;
  }
  return nbsList.find((nbs) => nbs.codigo === normalized);
}

export function searchNbs(query: string, options?: { limit?: number }): readonly Nbs[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Nbs[] = [];

  for (const nbs of nbsList) {
    if (nbs.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(nbs);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
