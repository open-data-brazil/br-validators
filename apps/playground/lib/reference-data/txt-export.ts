import { getDatasetMetadata } from '@br-validators/core/data-catalog';
import type { DatasetAdapter, NormalizedRow } from './dataset-adapter';
import { resolveCatalogDocUrl } from './catalog-docs';

export const TXT_SECTION_SEPARATOR = '='.repeat(80);
export const TXT_ROW_SEPARATOR = '-'.repeat(80);
export const TXT_EXPORT_ROW_COUNT_CONFIRM_THRESHOLD = 10_000;
export const TXT_EXPORT_SIZE_HINT_THRESHOLD_BYTES = 1_048_576;

const textEncoder = new TextEncoder();

export type TxtExportMode = 'search-results' | 'single-dataset' | 'multi-dataset';

export interface TxtSectionMeta {
  exportedAt?: string;
  sourceUrl?: string;
  query?: string;
  mode: TxtExportMode;
  uf?: string;
  year?: number;
  moeda?: string;
  desde?: string;
  ate?: string;
}

export interface TxtSection {
  adapter: DatasetAdapter;
  rows: readonly NormalizedRow[];
  meta: TxtSectionMeta;
}

/** Resolve official documentation URL from catalog metadata. */
export function resolveDatasetSourceUrl(datasetId: string): string {
  const metadata = getDatasetMetadata(datasetId);
  if (metadata === undefined) {
    return '';
  }
  return resolveCatalogDocUrl(metadata.documentacao);
}

/** `{datasetId}-{yyyy-mm-dd}.txt` or mode-specific name for bundles/search. */
export function buildExportFilename(
  datasetId: string,
  mode: TxtExportMode,
  date: Date = new Date(),
): string {
  const isoDate = date.toISOString().slice(0, 10);
  if (mode === 'search-results') {
    return `search-${isoDate}.txt`;
  }
  if (mode === 'multi-dataset') {
    return `bundle-${datasetId}-${isoDate}.txt`;
  }
  return `${datasetId}-${isoDate}.txt`;
}

/** Format one row — first field bracketed per stable TXT contract (README 36c). */
export function formatTxtRowBlock(row: NormalizedRow, fieldKeys: readonly string[]): string {
  if (fieldKeys.length === 0) {
    return '';
  }

  return fieldKeys
    .map((key, index) => {
      const value = row[key];
      const display = value === null ? '' : String(value);
      const line = `${key}: ${display}`;
      return index === 0 ? `[${line}]` : line;
    })
    .join('\n');
}

/** Machine-skippable `#` header lines for one dataset section. */
export function formatTxtHeader(
  adapter: DatasetAdapter,
  rowCount: number,
  meta: TxtSectionMeta,
): string {
  const exportedAt = meta.exportedAt ?? new Date().toISOString();
  const sourceUrl = meta.sourceUrl ?? resolveDatasetSourceUrl(adapter.id);

  const headerLines = [
    `# @br-validators/core — dataset: ${adapter.id}`,
    `# nome: ${adapter.nome}`,
    `# capturadoEm: ${adapter.capturadoEm}`,
    `# exportedAt: ${exportedAt}`,
    `# rows: ${rowCount}`,
    `# mode: ${meta.mode}`,
  ];

  if (meta.query !== undefined && meta.query.length > 0) {
    headerLines.push(`# query: ${meta.query}`);
  }
  if (meta.uf !== undefined && meta.uf.length > 0) {
    headerLines.push(`# uf: ${meta.uf}`);
  }
  if (meta.year !== undefined) {
    headerLines.push(`# year: ${String(meta.year)}`);
  }
  if (meta.moeda !== undefined && meta.moeda.length > 0) {
    headerLines.push(`# moeda: ${meta.moeda}`);
  }
  if (meta.desde !== undefined && meta.desde.length > 0) {
    headerLines.push(`# desde: ${meta.desde}`);
  }
  if (meta.ate !== undefined && meta.ate.length > 0) {
    headerLines.push(`# ate: ${meta.ate}`);
  }
  if (sourceUrl.length > 0) {
    headerLines.push(`# source: ${sourceUrl}`);
  }

  return [...headerLines, TXT_SECTION_SEPARATOR, ''].join('\n');
}

/** Header + body for one dataset section. Empty rows still emit header with `rows: 0`. */
export function formatTxtSection(
  adapter: DatasetAdapter,
  rows: readonly NormalizedRow[],
  meta: TxtSectionMeta,
): string {
  const header = formatTxtHeader(adapter, rows.length, meta);

  if (rows.length === 0) {
    return header;
  }

  const body = rows
    .map((row) => formatTxtRowBlock(row, adapter.fieldKeys))
    .join(`\n\n${TXT_ROW_SEPARATOR}\n\n`);

  return `${header}${body}\n`;
}

/** Concatenate multiple dataset sections with 80× `=` separators. */
export function formatTxtBundle(sections: readonly TxtSection[]): string {
  if (sections.length === 0) {
    return '';
  }
  return sections
    .map((section) => formatTxtSection(section.adapter, section.rows, section.meta))
    .join(`\n\n${TXT_SECTION_SEPARATOR}\n\n`);
}

/** Client-only UTF-8 download via temporary anchor (see QrCodePanel pattern). */
export function downloadTextFile(filename: string, content: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function shouldConfirmLargeExport(rowCount: number): boolean {
  return rowCount > TXT_EXPORT_ROW_COUNT_CONFIRM_THRESHOLD;
}

/** UTF-8 byte length of export content (matches Blob download size). */
export function getUtf8ByteLength(content: string): number {
  return textEncoder.encode(content).length;
}

export function shouldShowExportSizeHint(byteLength: number): boolean {
  return byteLength > TXT_EXPORT_SIZE_HINT_THRESHOLD_BYTES;
}

/** Human-readable size for export hints (1 decimal MB, rounded KB). */
export function formatExportByteSize(bytes: number): string {
  if (bytes >= TXT_EXPORT_SIZE_HINT_THRESHOLD_BYTES) {
    return `${(bytes / TXT_EXPORT_SIZE_HINT_THRESHOLD_BYTES).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${String(Math.round(bytes / 1024))} KB`;
  }
  return `${String(bytes)} B`;
}
