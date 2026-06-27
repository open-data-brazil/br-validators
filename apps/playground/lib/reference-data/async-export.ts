import type { DatasetAdapter, NormalizedRow } from './dataset-adapter';
import { EXPORT_CHUNK_SIZE } from './export-limits';
import {
  formatTxtHeader,
  formatTxtRowBlock,
  formatTxtSection,
  TXT_ROW_SEPARATOR,
  type TxtSectionMeta,
} from './txt-export';

export class ExportCancelledError extends Error {
  constructor() {
    super('Export cancelled');
    this.name = 'ExportCancelledError';
  }
}

export interface AsyncExportProgress {
  processedRows: number;
  totalRows: number;
}

export interface AsyncExportOptions {
  chunkSize?: number;
  onProgress?: (progress: AsyncExportProgress) => void;
  signal?: AbortSignal;
}

/** Yield control so long exports do not block the tab. */
export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function assertNotCancelled(signal: AbortSignal | undefined): void {
  if (signal?.aborted === true) {
    throw new ExportCancelledError();
  }
}

/** Build row body in chunks with progress callbacks. */
export async function formatTxtBodyAsync(
  rows: readonly NormalizedRow[],
  fieldKeys: readonly string[],
  options: AsyncExportOptions = {},
): Promise<string> {
  if (rows.length === 0) {
    return '';
  }

  const chunkSize = options.chunkSize ?? EXPORT_CHUNK_SIZE;
  const blocks: string[] = [];

  for (let index = 0; index < rows.length; index += chunkSize) {
    assertNotCancelled(options.signal);
    const chunk = rows.slice(index, index + chunkSize);
    for (const row of chunk) {
      blocks.push(formatTxtRowBlock(row, fieldKeys));
    }
    options.onProgress?.({
      processedRows: Math.min(index + chunk.length, rows.length),
      totalRows: rows.length,
    });
    await yieldToMain();
  }

  return blocks.join(`\n\n${TXT_ROW_SEPARATOR}\n\n`);
}

/** Header sync + async body — used for large single-dataset exports. */
export async function formatTxtSectionAsync(
  adapter: DatasetAdapter,
  rows: readonly NormalizedRow[],
  meta: TxtSectionMeta,
  options: AsyncExportOptions = {},
): Promise<string> {
  if (rows.length === 0) {
    return formatTxtSection(adapter, rows, meta);
  }

  const header = formatTxtHeader(adapter, rows.length, meta);
  const body = await formatTxtBodyAsync(rows, adapter.fieldKeys, options);
  return `${header}${body}\n`;
}

/** ISS full export filters `loadAll()` by UF — core `searchIssMunicipal` requires non-empty query. */
export async function loadFullExportRows(
  adapter: DatasetAdapter,
  loadOptions: import('./dataset-adapter').SearchOptions | undefined,
): Promise<readonly NormalizedRow[]> {
  const rows = await adapter.loadAll(loadOptions);
  const uf = loadOptions?.uf?.trim().toUpperCase();
  if (adapter.id === 'iss-municipal' && uf !== undefined && uf.length > 0) {
    return rows.filter((row) => row.uf === uf);
  }
  return rows;
}
