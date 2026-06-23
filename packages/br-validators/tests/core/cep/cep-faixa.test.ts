import { describe, expect, it } from 'vitest';

import {
  CEP_FAIXA_CNEFE_BASE_URL,
  CEP_FAIXA_DATA_VERSION,
  CEP_FAIXA_GOLDEN_PREFIX_RJ,
  CEP_FAIXA_GOLDEN_PREFIX_SP,
  CEP_GOLDEN_PRIMARY,
  CEP_GOLDEN_SECONDARY,
  getCepFaixaInfo,
  getCepFaixas,
  validateCep,
} from '../../../src/core/cep/index.js';
import vectors from '../../vectors/cep-faixa.official.json';

describe('CEP faixa — official golden vectors', () => {
  it('resolves São Paulo prefix 01310 from golden CEP 01310100', () => {
    const faixa = getCepFaixaInfo(vectors.golden.saoPauloPrefix.prefixo);
    expect(faixa?.prefixo).toBe(CEP_FAIXA_GOLDEN_PREFIX_SP);
    expect(faixa?.uf).toBe(vectors.golden.saoPauloPrefix.uf);
    expect(faixa?.codigoIbge).toBe(vectors.golden.saoPauloPrefix.codigoIbge);
    expect(faixa?.cidade).toContain(vectors.golden.saoPauloPrefix.cidadeContains);
    expect(getCepFaixaInfo(CEP_GOLDEN_PRIMARY)?.prefixo).toBe(CEP_FAIXA_GOLDEN_PREFIX_SP);
  });

  it('resolves Rio de Janeiro prefix 20040 from golden CEP 20040020', () => {
    const faixa = getCepFaixaInfo(vectors.golden.rioPrefix.prefixo);
    expect(faixa?.prefixo).toBe(CEP_FAIXA_GOLDEN_PREFIX_RJ);
    expect(faixa?.uf).toBe(vectors.golden.rioPrefix.uf);
    expect(faixa?.codigoIbge).toBe(vectors.golden.rioPrefix.codigoIbge);
    expect(faixa?.cidade).toContain(vectors.golden.rioPrefix.cidadeContains);
    expect(getCepFaixaInfo(CEP_GOLDEN_SECONDARY)?.prefixo).toBe(CEP_FAIXA_GOLDEN_PREFIX_RJ);
  });

  it('accepts masked or 8-digit CEP input for prefix lookup', () => {
    expect(getCepFaixaInfo('01310-100')?.uf).toBe('SP');
    expect(getCepFaixaInfo('20040-020')?.uf).toBe('RJ');
  });

  it('returns undefined for unknown or invalid prefixes', () => {
    expect(getCepFaixaInfo('99999')).toBeUndefined();
    expect(getCepFaixaInfo('')).toBeUndefined();
    expect(getCepFaixaInfo('abc')).toBeUndefined();
    expect(getCepFaixaInfo('1234')).toBeUndefined();
  });
});

describe('CEP faixa — coverage and metadata', () => {
  it('lists prefixes within expected CNEFE range', () => {
    const list = getCepFaixas();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minPrefixes);
    expect(list.length).toBeLessThanOrEqual(vectors.maxPrefixes);
    expect(new Set(list.map((faixa) => faixa.prefixo)).size).toBe(list.length);
    expect(list.every((faixa) => /^\d{5}$/.test(faixa.prefixo))).toBe(true);
  });

  it('does not break structural CEP validation', () => {
    expect(validateCep(CEP_GOLDEN_PRIMARY).ok).toBe(true);
    expect(validateCep(CEP_GOLDEN_SECONDARY).ok).toBe(true);
  });

  it('exposes official IBGE CNEFE endpoint in metadata', () => {
    expect(CEP_FAIXA_DATA_VERSION.id).toBe('cep-faixas');
    expect(CEP_FAIXA_DATA_VERSION.endpoints).toContain(CEP_FAIXA_CNEFE_BASE_URL);
    expect(CEP_FAIXA_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(CEP_FAIXA_DATA_VERSION.contagens.faixas).toBe(getCepFaixas().length);
  });
});
