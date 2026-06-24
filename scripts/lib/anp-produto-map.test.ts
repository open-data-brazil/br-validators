import { describe, expect, it } from 'vitest';

import { isAnpCombustivel, normalizeAnpProdutoLabel } from './anp-produto-map.js';

describe('anp-produto-map', () => {
  it('normalizes summary and station ANP labels', () => {
    expect(normalizeAnpProdutoLabel('ETANOL HIDRATADO')).toBe('ETHANOL');
    expect(normalizeAnpProdutoLabel('ETANOL')).toBe('ETHANOL');
    expect(normalizeAnpProdutoLabel('GASOLINA COMUM')).toBe('GASOLINE_REGULAR');
    expect(normalizeAnpProdutoLabel('OLEO DIESEL S10')).toBe('DIESEL_S10');
    expect(normalizeAnpProdutoLabel('GLP')).toBe('LPG_P13');
  });

  it('returns null for unknown labels', () => {
    expect(normalizeAnpProdutoLabel('')).toBeNull();
    expect(normalizeAnpProdutoLabel('UNKNOWN FUEL')).toBeNull();
  });

  it('validates enum membership', () => {
    expect(isAnpCombustivel('ETHANOL')).toBe(true);
    expect(isAnpCombustivel('NOT_A_FUEL')).toBe(false);
  });
});
