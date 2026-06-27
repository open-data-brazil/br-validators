import { getDatasetMetadata } from '@br-validators/core/data-catalog';
import type { DatasetAdapter, NormalizedRow } from './dataset-adapter';
import { resolveCatalogDocUrl } from './catalog-docs';

export const TXT_SECTION_SEPARATOR = '='.repeat(80);
export const TXT_ROW_SEPARATOR = '-'.repeat(80);
export const TXT_EXPORT_ROW_COUNT_CONFIRM_THRESHOLD = 10_000;

export type TxtExportMode = 'search-results' | 'single-dataset' | 'multi-dataset';

export interface TxtSectionMeta {
  exportedAt?: string;
  sourceUrl?: string;
  query?: string;
  mode: TxtExportMode;
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

/** Header + body for one dataset section. Empty rows still emit header with `rows: 0`. */
export function formatTxtSection(
  adapter: DatasetAdapter,
  rows: readonly NormalizedRow[],
  meta: TxtSectionMeta,
): string {
  const exportedAt = meta.exportedAt ?? new Date().toISOString();
  const sourceUrl = meta.sourceUrl ?? resolveDatasetSourceUrl(adapter.id);

  const headerLines = [
    `# @br-validators/core — dataset: ${adapter.id}`,
    `# nome: ${adapter.nome}`,
    `# capturadoEm: ${adapter.capturadoEm}`,
    `# exportedAt: ${exportedAt}`,
    `# rows: ${rows.length}`,
    `# mode: ${meta.mode}`,
  ];

  if (meta.query !== undefined && meta.query.length > 0) {
    headerLines.push(`# query: ${meta.query}`);
  }
  if (sourceUrl.length > 0) {
    headerLines.push(`# source: ${sourceUrl}`);
  }

  const header = [...headerLines, TXT_SECTION_SEPARATOR, ''].join('\n');

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
