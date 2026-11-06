/** Normalized row for playground TXT export — scalar fields only. */
export type NormalizedRow = Record<string, string | number | null>;

/** Optional filters passed to {@link DatasetAdapter.loadAll} and {@link DatasetAdapter.search}. */
export interface SearchOptions {
  limit?: number;
  uf?: string;
  year?: number;
  moeda?: string;
  desde?: string;
  ate?: string;
  tableId?: string;
}

export interface DatasetAdapter {
  /** Matches {@link getDataCatalog} entry id. */
  id: string;
  nome: string;
  capturadoEm: string;
  fieldKeys: readonly string[];
  playgroundRoute?: string;
  /** Documents non-standard loader when core has no public `getAll*`. */
  loaderNote?: string;
  /** Human-readable hint for dataset-specific search/load options (e.g. PTAX moeda + date range). */
  searchOptionsHint?: string;
  loadAll: (options?: SearchOptions) => Promise<readonly NormalizedRow[]>;
  search?: (query: string, options?: SearchOptions) => Promise<readonly NormalizedRow[]>;
  formatRow: (row: NormalizedRow) => string;
}

/** Trim, collapse whitespace, strip diacritics — same pattern as ISS municipal name filter. */
export function normalizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

/** Client-side substring filter when core exposes no `search*` for the dataset. */
export function clientFilterRows(
  rows: readonly NormalizedRow[],
  query: string,
  fieldKeys: readonly string[],
  options?: { limit?: number },
): readonly NormalizedRow[] {
  const needle = normalizeSearchQuery(query);
  if (needle.length === 0) {
    return rows;
  }

  const limit = options?.limit ?? rows.length;
  const results: NormalizedRow[] = [];

  for (const row of rows) {
    const haystack = fieldKeys
      .map((key) => row[key])
      .filter((value) => value !== null)
      .map((value) => normalizeSearchQuery(String(value)))
      .join(' ');

    if (haystack.includes(needle)) {
      results.push(row);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}

/** Stable `key: value` block for TXT export — field order follows `fieldKeys`. */
export function rowToKeyValueBlock(row: NormalizedRow, fieldKeys: readonly string[]): string {
  return fieldKeys
    .map((key) => {
      const value = row[key];
      const display = value === null ? '' : String(value);
      return `${key}: ${display}`;
    })
    .join('\n');
}

export function createFormatRow(fieldKeys: readonly string[]): (row: NormalizedRow) => string {
  return (row) => rowToKeyValueBlock(row, fieldKeys);
}

/** Map object fields into a normalized row; arrays become comma-separated strings. */
export function pickRowFields(
  source: object,
  fieldKeys: readonly string[],
  extra?: NormalizedRow,
): NormalizedRow {
  const record = source as Record<string, string | number | boolean | null | readonly string[] | undefined>;
  const row: NormalizedRow = { ...extra };

  for (const key of fieldKeys) {
    if (key in row) {
      continue;
    }

    const raw = record[key];
    if (raw === undefined) {
      row[key] = null;
    } else if (typeof raw === 'boolean') {
      row[key] = raw ? 'true' : 'false';
    } else if (Array.isArray(raw)) {
      row[key] = raw.join(', ');
    } else if (typeof raw === 'string' || typeof raw === 'number' || raw === null) {
      row[key] = raw;
    } else {
      row[key] = null;
    }
  }

  return row;
}

export function resolveSearchLimit(options?: SearchOptions, fallback = 10): number {
  return options?.limit ?? fallback;
}

export function resolveFeriadosYear(options?: SearchOptions): number {
  return options?.year ?? new Date().getFullYear();
}
