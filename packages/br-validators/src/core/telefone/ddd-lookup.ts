/**
 * Anatel DDD geographic lookup — offline embedded data.
 * @see https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais
 */

import { ANATEL_DDD_SET } from './constants.js';
import dddData from './data/ddd-municipios.json';
import type { DddInfo } from './ddd-types.js';

const dddByCode = new Map<string, DddInfo>(
  (dddData as DddInfo[]).map((entry) => [entry.ddd, entry]),
);

function normalizeDdd(ddd: string): string {
  const digits = ddd.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(2, '0').slice(-2);
}

export function getDddInfo(ddd: string): DddInfo | undefined {
  const normalized = normalizeDdd(ddd);
  if (normalized.length !== 2 || !ANATEL_DDD_SET.has(normalized)) {
    return undefined;
  }
  return dddByCode.get(normalized);
}
