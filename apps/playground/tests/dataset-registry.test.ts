import { getDataCatalog } from '@br-validators/core/data-catalog';
import { describe, expect, it } from 'vitest';
import { clientFilterRows, normalizeSearchQuery, rowToKeyValueBlock } from '../lib/reference-data/dataset-adapter';
import {
  DATASET_ADAPTER_IDS,
  getAllDatasetAdapters,
  getDatasetAdapter,
} from '../lib/reference-data/dataset-registry';

describe('dataset registry', () => {
  it('covers every getDataCatalog() id', () => {
    const catalogIds = getDataCatalog().map((entry) => entry.id).sort();
    const adapterIds = [...DATASET_ADAPTER_IDS].sort();
    expect(adapterIds).toEqual(catalogIds);
    expect(getAllDatasetAdapters().length).toBe(getDataCatalog().length);
  });

  it('returns adapter by id', () => {
    const ncm = getDatasetAdapter('ncm');
    expect(ncm?.id).toBe('ncm');
    expect(getDatasetAdapter('nonexistent')).toBeUndefined();
  });

  it('normalizeSearchQuery strips diacritics and collapses whitespace', () => {
    expect(normalizeSearchQuery('  São   Paulo  ')).toBe('sao paulo');
  });

  it('clientFilterRows matches normalized substring', () => {
    const rows = [{ codigo: '01', descricao: 'Soja em grão' }];
    expect(clientFilterRows(rows, 'soja', ['descricao'])).toHaveLength(1);
    expect(clientFilterRows(rows, 'milho', ['descricao'])).toHaveLength(0);
  });
});

describe('adapter family TXT serialization', () => {
  const families: { label: string; id: string }[] = [
    { label: 'fiscal codes', id: 'ncm' },
    { label: 'CST multi-tax', id: 'cst' },
    { label: 'eSocial', id: 'esocial' },
    { label: 'tabular finance', id: 'irpf' },
    { label: 'geographic', id: 'ibge' },
    { label: 'metadata-only', id: 'transparencia-snapshots' },
  ];

  it.each(families)('$label ($id) serializes a non-empty TXT block', async ({ id }) => {
    const adapter = getDatasetAdapter(id);
    expect(adapter).toBeDefined();

    const loadOptions =
      id === 'feriados'
        ? { year: new Date().getFullYear() }
        : id === 'ptax'
          ? { moeda: 'USD' }
          : undefined;
    const rows = await adapter?.loadAll(loadOptions);

    expect(rows?.length).toBeGreaterThan(0);
    const first = rows?.[0];
    expect(first).toBeDefined();

    const txt = adapter?.formatRow(first as Record<string, string | number | null>);
    expect(txt?.trim().length).toBeGreaterThan(0);
    expect(txt).toBe(rowToKeyValueBlock(first as Record<string, string | number | null>, adapter?.fieldKeys ?? []));
  });
});

describe('special adapters', () => {
  it('CST adapter exposes tax dimension in serialized output', async () => {
    const adapter = getDatasetAdapter('cst');
    const rows = await adapter?.loadAll();
    const icmsRow = rows?.find((row) => row.tax === 'icms');
    expect(icmsRow).toBeDefined();
    const txt = adapter?.formatRow(icmsRow as Record<string, string | number | null>);
    expect(txt).toContain('tax: icms');
  });

  it('feriados adapter defaults to current year', async () => {
    const adapter = getDatasetAdapter('feriados');
    const rows = await adapter?.loadAll();
    const year = new Date().getFullYear();
    expect(rows?.every((row) => String(row.data).startsWith(String(year)))).toBe(true);
  });

  it('PTAX adapter documents moeda and date range in metadata', () => {
    const adapter = getDatasetAdapter('ptax');
    expect(adapter?.searchOptionsHint).toMatch(/moeda/i);
    expect(adapter?.loaderNote).toMatch(/getPtax/i);
  });
});
