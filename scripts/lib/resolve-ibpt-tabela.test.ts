import { describe, expect, it } from 'vitest';

import { resolveLatestIbptTabela, type IbptMetaPayload } from './resolve-ibpt-tabela.js';

const VALRAW_META_SHAPE: IbptMetaPayload = {
  anos: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017],
  versoes: {
    '2017': ['17.1.A', '17.1.B', '17.2.A', '17.2.B'],
    '2026': ['26.1.C', '26.1.E', '26.1.F', '26.1.G', '26.1.H', '26.1.K'],
  },
};

describe('resolveLatestIbptTabela', () => {
  it('picks max year, not last array entry (valraw lists years descending)', () => {
    const resolved = resolveLatestIbptTabela(VALRAW_META_SHAPE);
    expect(resolved.ano).toBe(2026);
    expect(resolved.tabela).toBe('26.1.K');
  });

  it('picks max year when anos are ascending', () => {
    const resolved = resolveLatestIbptTabela({
      anos: [2017, 2018, 2026],
      versoes: { '2026': ['26.1.H'] },
    });
    expect(resolved).toEqual({ ano: 2026, tabela: '26.1.H' });
  });

  it('throws when anos is empty', () => {
    expect(() => resolveLatestIbptTabela({ anos: [], versoes: {} })).toThrow('no years');
  });

  it('throws when year has no versions', () => {
    expect(() =>
      resolveLatestIbptTabela({ anos: [2026], versoes: { '2025': ['25.1.A'] } }),
    ).toThrow('no versions for year 2026');
  });
});
