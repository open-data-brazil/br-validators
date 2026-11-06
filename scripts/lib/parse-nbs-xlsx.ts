/**
 * Parse NFSe Anexo B NBS xlsx (sheet 2) without external xlsx dependencies.
 * XLSX is a ZIP archive with sharedStrings + worksheet XML.
 * @see https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx
 */

import { spawnSync } from 'node:child_process';

export interface NbsRecord {
  codigo: string;
  descricao: string;
}

const SHARED_STRING_ENTRY_PATTERN = /<si>([\s\S]*?)<\/si>/g;
const CELL_PATTERN = /<c r="([A-Z]+)\d+"([^>]*)>\s*<v>([^<]*)<\/v>\s*<\/c>/g;
const LEAF_CODE_PATTERN = /^\d\.\d{4}\.\d{2}\.\d{2}$/;

function extractZipEntry(zipPath: string, entryName: string): string {
  const result = spawnSync('unzip', ['-p', zipPath, entryName], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0 || result.stdout.length === 0) {
    throw new Error(`Failed to extract ${entryName} from NBS xlsx`);
  }
  return result.stdout;
}

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  let match: RegExpExecArray | null = SHARED_STRING_ENTRY_PATTERN.exec(xml);

  while (match !== null) {
    const entry = match[1];
    const richTextParts = [...entry.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((part) => part[1]);
    strings.push(richTextParts.join(''));
    match = SHARED_STRING_ENTRY_PATTERN.exec(xml);
  }

  return strings;
}

function parseSheetRows(sheetXml: string, sharedStrings: string[]): Map<string, string>[] {
  const rows: Map<string, string>[] = [];
  const rowChunks = sheetXml.split(/<row r="/).slice(1);

  for (const chunk of rowChunks) {
    const cells = new Map<string, string>();
    const rowXml = `<row r="${chunk}`;
    let match: RegExpExecArray | null = CELL_PATTERN.exec(rowXml);

    while (match !== null) {
      const column = match[1];
      const type = match[2];
      let value = match[3];
      if (type.includes('t="s"')) {
        value = sharedStrings[Number.parseInt(value, 10)] ?? '';
      }
      cells.set(column, value);
      match = CELL_PATTERN.exec(rowXml);
    }

    if (cells.size > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

export function parseNbsXlsx(zipPath: string): NbsRecord[] {
  const sharedStringsXml = extractZipEntry(zipPath, 'xl/sharedStrings.xml');
  const sheetXml = extractZipEntry(zipPath, 'xl/worksheets/sheet2.xml');
  const sharedStrings = parseSharedStrings(sharedStringsXml);
  const rows = parseSheetRows(sheetXml, sharedStrings);
  const byCodigo = new Map<string, NbsRecord>();

  for (const row of rows) {
    const codigo = (row.get('A') ?? '').trim();
    const descricao = (row.get('B') ?? '').trim();
    if (!LEAF_CODE_PATTERN.test(codigo) || descricao.length === 0) {
      continue;
    }
    if (!byCodigo.has(codigo)) {
      byCodigo.set(codigo, { codigo, descricao });
    }
  }

  return [...byCodigo.values()].sort((left, right) => left.codigo.localeCompare(right.codigo));
}
