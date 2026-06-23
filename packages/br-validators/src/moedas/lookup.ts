/**
 * ISO 4217 currency lookup — offline embedded data with Bacen PTAX enrichment.
 * @see docs/OFFICIAL-SOURCES.md#moedas
 */

import moedasData from './data/moedas.json';
import type { Moeda } from './types.js';

const moedas: readonly Moeda[] = moedasData as Moeda[];

function normalizeCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

export function getMoedas(): readonly Moeda[] {
  return moedas;
}

export function getMoedaPorCodigo(codigo: string): Moeda | undefined {
  const normalized = normalizeCodigo(codigo);
  if (!/^[A-Z]{3}$/.test(normalized)) {
    return undefined;
  }
  return moedas.find((moeda) => moeda.codigo === normalized);
}

export function searchMoedas(query: string, options?: { limit?: number }): readonly Moeda[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Moeda[] = [];

  for (const moeda of moedas) {
    const matchesNome = moeda.nome.toLowerCase().includes(normalizedQuery);
    const matchesCodigo = moeda.codigo.toLowerCase().includes(normalizedQuery);
    if (matchesNome || matchesCodigo) {
      results.push(moeda);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
