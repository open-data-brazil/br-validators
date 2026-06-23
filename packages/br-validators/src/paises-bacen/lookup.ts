/**
 * NF-e Bacen country code lookup — offline embedded data from official NF-e table.
 * @see docs/OFFICIAL-SOURCES.md#paises-bacen
 */

import paisesData from './data/paises.json';
import type { PaisBacen } from './types.js';

const paises: readonly PaisBacen[] = paisesData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(4, '0').slice(-4);
}

export function getPaisesBacen(): readonly PaisBacen[] {
  return paises;
}

export function getPaisPorCodigoBacen(codigo: string): PaisBacen | undefined {
  const normalized = normalizeCodigo(codigo);
  if (normalized.length !== 4) {
    return undefined;
  }
  return paises.find((pais) => pais.codigo === normalized);
}
