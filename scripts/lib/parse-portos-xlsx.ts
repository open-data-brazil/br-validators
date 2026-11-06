/**
 * Parse ANTAQ Portos.xlsx from geographic open-data zip.
 * @see https://www.gov.br/antaq/pt-br/central-de-conteudos/informacoes-geograficas
 */

import { parseXlsxSheet } from './parse-xlsx-zip.js';

export interface PortoRecord {
  codigo: string;
  nome: string;
  tipo: string;
  situacao: string;
  uf: string;
  municipioNome: string;
  municipioIbge: number | null;
  latitude: number | null;
  longitude: number | null;
}

const PORTO_CODE_PATTERN = /^BR[A-Z0-9]{3,8}$/;

function normalizePortoCode(value: string): string {
  return value.trim().toUpperCase();
}

function parseCoordinate(value: string): number | null {
  const normalized = value
    .replace(/[^\d.,-]/g, '')
    .replace(',', '.')
    .trim();
  if (normalized.length === 0) {
    return null;
  }
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMunicipioIbge(idCidade: string): number | null {
  const digits = idCidade.replace(/^BR/i, '').replace(/\D/g, '');
  if (digits.length < 6 || digits.length > 7) {
    return null;
  }
  const normalized = digits.length === 6 ? `${digits}0` : digits;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function readCell(row: Map<string, string>, column: string): string {
  return (row.get(column) ?? '').trim();
}

export function parsePortosXlsx(xlsxPath: string): PortoRecord[] {
  const rows = parseXlsxSheet(xlsxPath, 'xl/worksheets/sheet1.xml');
  if (rows.length < 2) {
    throw new Error('Portos.xlsx has no data rows');
  }

  const byCodigo = new Map<string, PortoRecord>();

  for (const row of rows.slice(1)) {
    const codigo = normalizePortoCode(readCell(row, 'C'));
    const nome = readCell(row, 'D');
    const tipo = readCell(row, 'E');
    const situacao = readCell(row, 'I');
    const municipioIbge = parseMunicipioIbge(readCell(row, 'U'));
    const municipioNome = readCell(row, 'V');
    const uf = readCell(row, 'X').toUpperCase();
    const latitude = parseCoordinate(readCell(row, 'AB'));
    const longitude = parseCoordinate(readCell(row, 'AC'));

    if (!PORTO_CODE_PATTERN.test(codigo) || nome.length === 0) {
      continue;
    }

    if (!byCodigo.has(codigo)) {
      byCodigo.set(codigo, {
        codigo,
        nome,
        tipo,
        situacao,
        uf,
        municipioNome,
        municipioIbge,
        latitude,
        longitude,
      });
    }
  }

  return [...byCodigo.values()].sort((left, right) => left.codigo.localeCompare(right.codigo));
}
