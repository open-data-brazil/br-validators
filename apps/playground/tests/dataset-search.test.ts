import { describe, expect, it } from 'vitest';
import { IBGE_GOLDEN_MUNICIPIO_SP } from '@br-validators/core/ibge';
import { NCM_GOLDEN_SOJA_SEMENTES } from '@br-validators/core/ncm';
import {
  isDatasetSearchQueryEligible,
  searchDatasets,
} from '../lib/reference-data/dataset-search';

describe('isDatasetSearchQueryEligible', () => {
  it('allows numeric codes with fewer than 2 chars', () => {
    expect(isDatasetSearchQueryEligible('1')).toBe(true);
  });

  it('requires 2 chars for text queries', () => {
    expect(isDatasetSearchQueryEligible('a')).toBe(false);
    expect(isDatasetSearchQueryEligible('ab')).toBe(true);
  });
});

describe('searchDatasets', () => {
  it('returns IBGE hit for municipality code 3550308', async () => {
    const results = await searchDatasets(String(IBGE_GOLDEN_MUNICIPIO_SP));
    const ibge = results.find((group) => group.datasetId === 'ibge');
    expect(ibge).toBeDefined();
    expect(ibge?.rows.some((row) => row.codigo === IBGE_GOLDEN_MUNICIPIO_SP)).toBe(true);
  });

  it('returns NCM hit for soja via core searchNcm', async () => {
    const results = await searchDatasets('soja');
    const ncm = results.find((group) => group.datasetId === 'ncm');
    expect(ncm).toBeDefined();
    expect(ncm?.rows.length).toBeGreaterThan(0);
    expect(
      ncm?.rows.some(
        (row) => row.codigo === NCM_GOLDEN_SOJA_SEMENTES || String(row.descricao).toLowerCase().includes('soja'),
      ),
    ).toBe(true);
  });

  it('returns empty for unknown dataset filter without throwing', async () => {
    await expect(
      searchDatasets('soja', { datasetId: 'nonexistent-dataset-id' }),
    ).resolves.toEqual([]);
  });
});
