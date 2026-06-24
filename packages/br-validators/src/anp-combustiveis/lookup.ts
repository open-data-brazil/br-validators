/**
 * ANP weekly fuel price survey — offline embedded municipal averages.
 * @see docs/OFFICIAL-SOURCES.md#anp-combustiveis
 */

import precosMediosData from './data/precos-medios.json';
import semanasData from './data/semanas.json';
import type { AnpCombustivel, AnpPrecoMedio, AnpPrecosMediosQuery, AnpSemanaPesquisa } from './types.js';
import { ANP_COMBUSTIVEL_VALUES } from './types.js';

const precosMedios: readonly AnpPrecoMedio[] = precosMediosData as AnpPrecoMedio[];
const semanas: readonly AnpSemanaPesquisa[] = semanasData;

function normalizePlaceName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUf(uf: string): string {
  return uf.trim().toUpperCase();
}

function isValidCombustivel(produto: string): produto is AnpCombustivel {
  return (ANP_COMBUSTIVEL_VALUES as readonly string[]).includes(produto);
}

function resolveSemanaInicio(semanaInicio?: string): string | undefined {
  if (semanaInicio === undefined) {
    return pickLatestAnpSemana(semanas)?.inicio;
  }
  const trimmed = semanaInicio.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function pickLatestAnpSemana(items: readonly AnpSemanaPesquisa[]): AnpSemanaPesquisa | undefined {
  if (items.length === 0) {
    return undefined;
  }
  return [...items].sort((left, right) => right.inicio.localeCompare(left.inicio))[0];
}

export function getAnpSemanasPesquisa(): readonly AnpSemanaPesquisa[] {
  return semanas;
}

export function getAnpSemanaAtual(): AnpSemanaPesquisa | undefined {
  return pickLatestAnpSemana(semanas);
}

export function getAnpPrecosMedios(query: AnpPrecosMediosQuery): AnpPrecoMedio | undefined {
  const uf = normalizeUf(query.uf);
  if (!/^[A-Z]{2}$/.test(uf)) {
    return undefined;
  }

  const municipio = normalizePlaceName(query.municipio);
  if (municipio.length === 0) {
    return undefined;
  }

  if (!isValidCombustivel(query.produto)) {
    return undefined;
  }

  const semanaInicio = resolveSemanaInicio(query.semanaInicio);
  if (semanaInicio === undefined) {
    return undefined;
  }

  return precosMedios.find(
    (record) =>
      record.semanaInicio === semanaInicio &&
      record.uf === uf &&
      normalizePlaceName(record.municipioNome) === municipio &&
      record.produto === query.produto,
  );
}

export function getAnpPrecosMediosPorIbge(
  codigo: number,
  produto: AnpCombustivel,
  semanaInicio?: string,
): AnpPrecoMedio | undefined {
  if (!Number.isInteger(codigo) || codigo <= 0) {
    return undefined;
  }

  if (!isValidCombustivel(produto)) {
    return undefined;
  }

  const resolvedSemana = resolveSemanaInicio(semanaInicio);
  if (resolvedSemana === undefined) {
    return undefined;
  }

  return precosMedios.find(
    (record) =>
      record.semanaInicio === resolvedSemana &&
      record.municipioIbge === codigo &&
      record.produto === produto,
  );
}

export function getAnpPrecosMediosEmbedded(): readonly AnpPrecoMedio[] {
  return precosMedios;
}
