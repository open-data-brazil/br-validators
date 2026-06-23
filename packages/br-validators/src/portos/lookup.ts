/**
 * ANTAQ port installations lookup — offline embedded data from official open-data xlsx.
 * @see docs/OFFICIAL-SOURCES.md#portos
 */

import portosData from './data/portos.json';
import type { Porto } from './types.js';

const portos: readonly Porto[] = portosData;

function normalizeCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

export function getPortos(): readonly Porto[] {
  return portos;
}

export function getPortoPorCodigo(codigo: string): Porto | undefined {
  const normalized = normalizeCodigo(codigo);
  if (!/^BR[A-Z0-9]{3,8}$/.test(normalized)) {
    return undefined;
  }
  return portos.find((porto) => porto.codigo === normalized);
}

export function getPortosPorMunicipio(ibgeCodigo: number): readonly Porto[] {
  if (!Number.isInteger(ibgeCodigo) || ibgeCodigo <= 0) {
    return [];
  }
  return portos.filter((porto) => porto.municipioIbge === ibgeCodigo);
}

export function searchPortos(query: string, options?: { limit?: number }): readonly Porto[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Porto[] = [];

  for (const porto of portos) {
    const matchesNome = porto.nome.toLowerCase().includes(normalizedQuery);
    const matchesCodigo = porto.codigo.toLowerCase().includes(normalizedQuery);
    const matchesMunicipio = porto.municipioNome.toLowerCase().includes(normalizedQuery);
    if (matchesNome || matchesCodigo || matchesMunicipio) {
      results.push(porto);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
