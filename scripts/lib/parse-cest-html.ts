/**
 * Parse CONFAZ Convênio ICMS 142/2018 annex tables for CEST codes.
 * @see https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18
 */

export interface CestRecord {
  codigo: string;
  descricao: string;
  ncms: string[];
  segmento: string;
}

const TABLE_PATTERN = /<table border="1"[^>]*>[\s\S]*?<\/table>/gi;
const SEGMENT_PATTERN = /<p class="A6-1Subtitulo">([^<]+)<\/p>\s*<table border="1"/gi;
const ROW_PATTERN = /<tr>([\s\S]*?)<\/tr>/gi;
const CELL_PATTERN = /<td[^>]*>([\s\S]*?)<\/td>/gi;
const CELL_TEXT_PATTERN = /<p class="A7-2Tabelajustificado"[^>]*>([^<]*)<\/p>/i;

function normalizeCestCodigo(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(7, '0').slice(-7);
}

function parseNcmTokens(value: string): string[] {
  return value
    .split(/\s+/)
    .map((token) => token.replace(/\D/g, ''))
    .filter((token) => token.length >= 4);
}

function extractSegments(html: string): { segmento: string; start: number; end: number }[] {
  const segments: { segmento: string; start: number; end: number }[] = [];
  let match: RegExpExecArray | null = SEGMENT_PATTERN.exec(html);

  while (match !== null) {
    segments.push({
      segmento: match[1].trim(),
      start: match.index,
      end: html.length,
    });
    match = SEGMENT_PATTERN.exec(html);
  }

  for (let index = 0; index < segments.length - 1; index += 1) {
    segments[index].end = segments[index + 1].start;
  }

  return segments;
}

function resolveSegmento(offset: number, segments: { segmento: string; start: number; end: number }[]): string {
  for (const segment of segments) {
    if (offset >= segment.start && offset < segment.end) {
      return segment.segmento;
    }
  }
  return 'UNKNOWN';
}

function parseRowCells(rowHtml: string): string[] {
  const cells: string[] = [];
  let cellMatch: RegExpExecArray | null = CELL_PATTERN.exec(rowHtml);

  while (cellMatch !== null) {
    const textMatch = CELL_TEXT_PATTERN.exec(cellMatch[1]);
    if (textMatch !== null) {
      cells.push(textMatch[1].trim());
    }
    cellMatch = CELL_PATTERN.exec(rowHtml);
  }

  return cells;
}

function parseCestTable(tableHtml: string, segmento: string, byCodigo: Map<string, CestRecord>): void {
  const rows = [...tableHtml.matchAll(ROW_PATTERN)].slice(1);

  for (const row of rows) {
    const cells = parseRowCells(row[1]);
    if (cells.length < 4) {
      continue;
    }

    const codigo = normalizeCestCodigo(cells[1]);
    const ncms = parseNcmTokens(cells[2]);
    const descricao = cells[3].trim();

    if (codigo.length !== 7 || descricao.length === 0 || ncms.length === 0) {
      continue;
    }

    if (!byCodigo.has(codigo)) {
      byCodigo.set(codigo, { codigo, descricao, ncms, segmento });
      continue;
    }
    const existing = byCodigo.get(codigo);
    if (existing === undefined) {
      continue;
    }

    const mergedNcms = new Set([...existing.ncms, ...ncms]);
    byCodigo.set(codigo, {
      ...existing,
      ncms: [...mergedNcms],
    });
  }
}

export function parseCestHtml(html: string): CestRecord[] {
  const segments = extractSegments(html);
  const byCodigo = new Map<string, CestRecord>();
  let tableMatch: RegExpExecArray | null = TABLE_PATTERN.exec(html);

  while (tableMatch !== null) {
    const tableHtml = tableMatch[0];
    if (tableHtml.includes('CEST')) {
      const segmento = resolveSegmento(tableMatch.index, segments);
      parseCestTable(tableHtml, segmento, byCodigo);
    }
    tableMatch = TABLE_PATTERN.exec(html);
  }

  return [...byCodigo.values()].sort((left, right) => left.codigo.localeCompare(right.codigo));
}
