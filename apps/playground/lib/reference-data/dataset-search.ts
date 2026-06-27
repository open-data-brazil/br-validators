import {
  clientFilterRows,
  type DatasetAdapter,
  type NormalizedRow,
} from './dataset-adapter';
import { getAllDatasetAdapters, getDatasetAdapter } from './dataset-registry';

export const DATASET_SEARCH_DEFAULT_LIMIT = 25;
export const DATASET_SEARCH_MIN_CHARS = 2;

export interface DatasetSearchOptions {
  datasetId?: string;
  limitPerDataset?: number;
}

export interface DatasetSearchResult {
  datasetId: string;
  nome: string;
  playgroundRoute?: string;
  rows: readonly NormalizedRow[];
  error?: string;
}

/** True when query is non-empty and meets min length (numeric codes bypass min chars). */
export function isDatasetSearchQueryEligible(query: string): boolean {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (/^\d+$/u.test(trimmed)) {
    return true;
  }
  return trimmed.length >= DATASET_SEARCH_MIN_CHARS;
}

function resolveAdapters(datasetId?: string): readonly DatasetAdapter[] {
  if (datasetId === undefined || datasetId.length === 0) {
    return getAllDatasetAdapters();
  }
  const adapter = getDatasetAdapter(datasetId);
  if (adapter === undefined) {
    return [];
  }
  return [adapter];
}

async function searchSingleAdapter(
  adapter: DatasetAdapter,
  query: string,
  limit: number,
): Promise<readonly NormalizedRow[]> {
  if (adapter.search !== undefined) {
    return adapter.search(query, { limit });
  }
  const allRows = await adapter.loadAll();
  return clientFilterRows(allRows, query, adapter.fieldKeys, { limit });
}

function toSearchResult(
  adapter: DatasetAdapter,
  rows: readonly NormalizedRow[],
  error?: string,
): DatasetSearchResult {
  return {
    datasetId: adapter.id,
    nome: adapter.nome,
    playgroundRoute: adapter.playgroundRoute,
    rows,
    error,
  };
}

/**
 * Cross-dataset search via registry adapters — prefers adapter `search()`, else client filter on `loadAll()`.
 * Runs adapters in parallel with `Promise.allSettled`; partial failures surface per dataset.
 */
export async function searchDatasets(
  query: string,
  options: DatasetSearchOptions = {},
): Promise<DatasetSearchResult[]> {
  if (!isDatasetSearchQueryEligible(query)) {
    return [];
  }

  const limit = options.limitPerDataset ?? DATASET_SEARCH_DEFAULT_LIMIT;
  const adapters = resolveAdapters(options.datasetId);
  if (adapters.length === 0) {
    return [];
  }

  const settled = await Promise.allSettled(
    adapters.map(async (adapter) => {
      const rows = await searchSingleAdapter(adapter, query, limit);
      return toSearchResult(adapter, rows);
    }),
  );

  const results: DatasetSearchResult[] = [];
  for (let index = 0; index < settled.length; index += 1) {
    const outcome = settled[index];
    const adapter = adapters[index];
    if (outcome.status === 'fulfilled') {
      if (outcome.value.rows.length > 0 || outcome.value.error !== undefined) {
        results.push(outcome.value);
      }
      continue;
    }
    const message =
      outcome.reason instanceof Error ? outcome.reason.message : 'Search failed for this dataset';
    results.push(toSearchResult(adapter, [], message));
  }

  return results.sort((left, right) => left.nome.localeCompare(right.nome));
}

/** Pick code + description-like fields for result list preview. */
export function formatDatasetRowPreview(
  row: NormalizedRow,
  fieldKeys: readonly string[],
): { primary: string; secondary: string } {
  const priorityKeys = ['codigo', 'iata', 'codigoIbge', 'id', 'ddd', 'data', 'moeda', 'ncm'];
  let primary = '';
  for (const key of priorityKeys) {
    const value = row[key];
    if (value !== null && String(value).length > 0) {
      primary = String(value);
      break;
    }
  }
  if (primary.length === 0) {
    if (fieldKeys.length > 0) {
      const value = row[fieldKeys[0]];
      primary = value === null ? '—' : String(value);
    } else {
      primary = '—';
    }
  }

  const descKeys = ['descricao', 'nome', 'grupo', 'natureza', 'tipo', 'regiao'];
  let secondary = '';
  for (const key of descKeys) {
    const value = row[key];
    if (value !== null && String(value).length > 0) {
      secondary = String(value);
      break;
    }
  }

  return { primary, secondary };
}
