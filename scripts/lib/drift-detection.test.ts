import { describe, expect, it } from 'vitest';

import {
  effectiveReportChanges,
  isRealDrift,
  isStaleBaseline,
  resolveDatasetDrift,
  sumReportTotals,
} from './drift-detection.js';

describe('drift-detection', () => {
  it('detects stale baseline when comparadoCom is null but counts exist', () => {
    expect(isStaleBaseline({ adicionados: 154, removidos: 0, alterados: 0, comparadoCom: null })).toBe(true);
  });

  it('detects real drift when comparadoCom is set', () => {
    const changes = { adicionados: 2, removidos: 0, alterados: 1, comparadoCom: '2026-06-23' };
    expect(isRealDrift(changes)).toBe(true);
  });

  it('treats stale baseline as unchanged in report with zero effective counts', () => {
    const resolution = resolveDatasetDrift({
      metadataChanges: { adicionados: 154, removidos: 0, alterados: 0, comparadoCom: null },
      capturadoEm: '2026-06-23',
    });
    expect(resolution.status).toBe('unchanged');
    expect(resolution.staleBaseline).toBe(true);
    expect(resolution.alteracoes).toEqual({
      adicionados: 0,
      removidos: 0,
      alterados: 0,
      comparadoCom: '2026-06-23',
    });
  });

  it('prefers snapshot field diff when provided', () => {
    const resolution = resolveDatasetDrift({
      metadataChanges: { adicionados: 0, removidos: 0, alterados: 0, comparadoCom: '2026-06-23' },
      capturadoEm: '2026-06-24',
      fieldStatus: 'changed',
      fieldAdicionados: 1,
      fieldRemovidos: 0,
      fieldAlterados: 0,
    });
    expect(resolution.status).toBe('changed');
    expect(resolution.alteracoes.adicionados).toBe(1);
  });

  it('sums totals only from changed datasets', () => {
    const totals = sumReportTotals([
      {
        status: 'unchanged',
        alteracoes: effectiveReportChanges(
          { adicionados: 154, removidos: 0, alterados: 0, comparadoCom: null },
          '2026-06-23',
        ),
      },
      {
        status: 'changed',
        alteracoes: { adicionados: 2, removidos: 0, alterados: 0, comparadoCom: '2026-06-23' },
      },
    ]);
    expect(totals.datasetsAlterados).toBe(1);
    expect(totals.totalAdicionados).toBe(2);
  });
});
