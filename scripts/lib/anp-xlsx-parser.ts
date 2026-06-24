/**
 * Parse ANP resumo_semanal_lpc XLSX — MUNICIPIOS sheet.
 */

import { findZipEntryName } from './parse-xlsx-zip.js';
import { parseAnpExcelDateCell } from './anp-excel-date.js';
import { normalizeAnpPlaceName } from './anp-place-normalize.js';
import { normalizeAnpProdutoLabel, type AnpCombustivel } from './anp-produto-map.js';
import { parseXlsxSheet } from './parse-xlsx-zip.js';

export const ANP_MUNICIPIOS_SHEET_SUFFIX = 'sheet2.xml';
export const ANP_MUNICIPIOS_HEADER_ROW_INDEX = 6;
export const ANP_MUNICIPIOS_DATA_ROW_START = 7;
export const ANP_MIN_PRECOS_MEDIOS = 2_000;
export const ANP_MAX_PRECOS_MEDIOS = 3_500;

export interface AnpPrecoMedioRecord {
  semanaInicio: string;
  semanaFim: string;
  uf: string;
  estadoNome: string;
  municipioNome: string;
  municipioIbge: number | null;
  produto: AnpCombustivel;
  postosPesquisados: number;
  unidade: string;
  precoMedio: number;
  precoMinimo: number;
  precoMaximo: number;
  desvioPadrao: number | null;
  coeficienteVariacao: number | null;
}

export interface IbgeMunicipioRef {
  codigo: number;
  nome: string;
  uf: string;
}

export interface IbgeEstadoRef {
  sigla: string;
  nome: string;
}

function parseAnpDecimal(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : null;
}

function parseRequiredInt(raw: string): number | null {
  const value = Number.parseInt(raw.trim(), 10);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function buildEstadoNomeToUfMap(estados: readonly IbgeEstadoRef[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const estado of estados) {
    map.set(normalizeAnpPlaceName(estado.nome), estado.sigla.toUpperCase());
  }
  return map;
}

export function buildMunicipioIndex(municipios: readonly IbgeMunicipioRef[]): Map<string, IbgeMunicipioRef> {
  const index = new Map<string, IbgeMunicipioRef>();
  for (const municipio of municipios) {
    const key = `${municipio.uf.toUpperCase()}:${normalizeAnpPlaceName(municipio.nome)}`;
    index.set(key, municipio);
  }
  return index;
}

export function resolveMunicipioIbge(
  estadoNome: string,
  municipioNome: string,
  estadoToUf: Map<string, string>,
  municipioIndex: Map<string, IbgeMunicipioRef>,
): { uf: string; municipioIbge: number | null } | null {
  const uf = estadoToUf.get(normalizeAnpPlaceName(estadoNome));
  if (uf === undefined) {
    return null;
  }
  const key = `${uf}:${normalizeAnpPlaceName(municipioNome)}`;
  const municipio = municipioIndex.get(key);
  return { uf, municipioIbge: municipio?.codigo ?? null };
}

function resolveMunicipiosSheetPath(xlsxPath: string): string {
  try {
    return findZipEntryName(xlsxPath, ANP_MUNICIPIOS_SHEET_SUFFIX);
  } catch {
    return `xl/worksheets/${ANP_MUNICIPIOS_SHEET_SUFFIX}`;
  }
}

export function parseAnpResumoMunicipiosRows(
  rows: readonly Map<string, string>[],
  estadoToUf: Map<string, string>,
  municipioIndex: Map<string, IbgeMunicipioRef>,
): AnpPrecoMedioRecord[] {
  const records: AnpPrecoMedioRecord[] = [];

  for (const row of rows.slice(ANP_MUNICIPIOS_DATA_ROW_START)) {
    const semanaInicio = parseAnpExcelDateCell(row.get('A') ?? '');
    const semanaFim = parseAnpExcelDateCell(row.get('B') ?? '');
    const estadoNome = (row.get('C') ?? '').trim();
    const municipioNome = (row.get('D') ?? '').trim();
    const produto = normalizeAnpProdutoLabel(row.get('E') ?? '');
    const postosPesquisados = parseRequiredInt(row.get('F') ?? '');
    const unidade = (row.get('G') ?? '').trim();
    const precoMedio = parseAnpDecimal(row.get('H') ?? '');
    const precoMinimo = parseAnpDecimal(row.get('J') ?? '');
    const precoMaximo = parseAnpDecimal(row.get('K') ?? '');

    if (
      semanaInicio === null ||
      semanaFim === null ||
      estadoNome.length === 0 ||
      municipioNome.length === 0 ||
      produto === null ||
      postosPesquisados === null ||
      unidade.length === 0 ||
      precoMedio === null ||
      precoMinimo === null ||
      precoMaximo === null
    ) {
      continue;
    }

    const location = resolveMunicipioIbge(estadoNome, municipioNome, estadoToUf, municipioIndex);
    if (location === null) {
      continue;
    }

    records.push({
      semanaInicio,
      semanaFim,
      uf: location.uf,
      estadoNome,
      municipioNome,
      municipioIbge: location.municipioIbge,
      produto,
      postosPesquisados,
      unidade,
      precoMedio,
      precoMinimo,
      precoMaximo,
      desvioPadrao: parseAnpDecimal(row.get('I') ?? ''),
      coeficienteVariacao: parseAnpDecimal(row.get('L') ?? ''),
    });
  }

  return records;
}

export function parseAnpResumoMunicipiosXlsx(
  xlsxPath: string,
  estados: readonly IbgeEstadoRef[],
  municipios: readonly IbgeMunicipioRef[],
): AnpPrecoMedioRecord[] {
  const sheetPath = resolveMunicipiosSheetPath(xlsxPath);
  const rows = parseXlsxSheet(xlsxPath, sheetPath);
  if (rows.length <= ANP_MUNICIPIOS_DATA_ROW_START) {
    throw new Error('ANP resumo_semanal MUNICIPIOS sheet has no data rows');
  }
  const estadoToUf = buildEstadoNomeToUfMap(estados);
  const municipioIndex = buildMunicipioIndex(municipios);
  return parseAnpResumoMunicipiosRows(rows, estadoToUf, municipioIndex);
}

export function assertAnpPrecosMediosBounds(count: number): void {
  if (count < ANP_MIN_PRECOS_MEDIOS || count > ANP_MAX_PRECOS_MEDIOS) {
    throw new Error(
      `Expected ${String(ANP_MIN_PRECOS_MEDIOS)}–${String(ANP_MAX_PRECOS_MEDIOS)} municipal price rows, got ${String(count)}`,
    );
  }
}

export function buildAnpSemanasFromRecords(records: readonly AnpPrecoMedioRecord[]): { inicio: string; fim: string }[] {
  const weeks = new Map<string, { inicio: string; fim: string }>();
  for (const record of records) {
    const key = `${record.semanaInicio}_${record.semanaFim}`;
    weeks.set(key, { inicio: record.semanaInicio, fim: record.semanaFim });
  }
  return [...weeks.values()].sort((left, right) => right.inicio.localeCompare(left.inicio));
}

export function anpPrecoMedioKey(record: Pick<AnpPrecoMedioRecord, 'semanaInicio' | 'uf' | 'municipioNome' | 'produto'>): string {
  return `${record.semanaInicio}|${record.uf}|${normalizeAnpPlaceName(record.municipioNome)}|${record.produto}`;
}
