/**
 * Minimal XLSX (ZIP + XML) parser without external dependencies.
 */

import { spawnSync } from 'node:child_process';

const SHARED_STRING_ENTRY_PATTERN = /<si>([\s\S]*?)<\/si>/g;
const CELL_PATTERN = /<c r="([A-Z]+)\d+"([^>]*)>\s*<v>([^<]*)<\/v>\s*<\/c>/g;

export function extractZipEntry(zipPath: string, entryName: string): string {
  const result = spawnSync('unzip', ['-p', zipPath, entryName], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  if (result.status !== 0 || result.stdout.length === 0) {
    throw new Error(`Failed to extract ${entryName} from ${zipPath}`);
  }
  return result.stdout;
}

export function findZipEntryName(zipPath: string, suffix: string): string {
  const result = spawnSync('unzip', ['-Z1', zipPath], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Failed to list entries in ${zipPath}`);
  }
  const entry = result.stdout
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.endsWith(suffix));
  if (entry === undefined || entry.length === 0) {
    throw new Error(`No ${suffix} entry found in ${zipPath}`);
  }
  return entry;
}

export function parseSharedStrings(xml: string): string[] {
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

export function parseSheetRows(sheetXml: string, sharedStrings: string[]): Map<string, string>[] {
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

export function parseXlsxSheet(zipPath: string, sheetPath: string): Map<string, string>[] {
  const sharedStringsXml = extractZipEntry(zipPath, 'xl/sharedStrings.xml');
  const sheetXml = extractZipEntry(zipPath, sheetPath);
  const sharedStrings = parseSharedStrings(sharedStringsXml);
  return parseSheetRows(sheetXml, sharedStrings);
}
