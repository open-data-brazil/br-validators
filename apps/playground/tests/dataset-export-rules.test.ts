import { describe, expect, it } from 'vitest';
import {
  assertExportRowCap,
  planFullDatasetExport,
} from '../lib/reference-data/dataset-export-rules';

describe('dataset-export-rules', () => {
  it('ibge full export requires UF', () => {
    expect(planFullDatasetExport('ibge', {}).allowed).toBe(false);
    expect(planFullDatasetExport('ibge', { uf: 'SP' }).allowed).toBe(true);
  });

  it('ncm full export includes embed size confirm', () => {
    const plan = planFullDatasetExport('ncm', {});
    expect(plan.allowed).toBe(true);
    expect(plan.confirmMessage).toContain('900 KB');
  });

  it('feriados uses year in loadOptions', () => {
    const plan = planFullDatasetExport('feriados', { year: 2025 });
    expect(plan.loadOptions?.year).toBe(2025);
  });

  it('ptax passes moeda and date range to loadOptions', () => {
    const plan = planFullDatasetExport('ptax', {
      moeda: 'EUR',
      desde: '2026-01-01',
      ate: '2026-06-01',
    });
    expect(plan.loadOptions?.moeda).toBe('EUR');
    expect(plan.loadOptions?.desde).toBe('2026-01-01');
    expect(plan.loadOptions?.ate).toBe('2026-06-01');
  });

  it('assertExportRowCap blocks above 50k', () => {
    expect(assertExportRowCap(50_000).allowed).toBe(true);
    expect(assertExportRowCap(50_001).allowed).toBe(false);
  });
});
