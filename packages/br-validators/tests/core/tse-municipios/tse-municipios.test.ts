import { describe, expect, it } from 'vitest';

import { getMunicipioPorCodigo } from '../../../src/ibge/index.js';
import {
  getCodigosTsePorMunicipio,
  getMapeamentoTseIbge,
  getMunicipioIbgePorCodigoTse,
  TSE_MUNICIPIOS_DATA_VERSION,
  TSE_MUNICIPIO_IBGE_ZIP_URL,
  TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO,
  TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO,
} from '../../../src/tse-municipios/index.js';
import vectors from '../../vectors/tse-municipios.official.json';

describe('TSE municipios — official golden vectors', () => {
  it('maps São Paulo TSE code to IBGE 3550308', () => {
    const ibge = getMunicipioIbgePorCodigoTse(vectors.golden.saoPaulo.codigoTse);
    expect(ibge).toBe(TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO);
    expect(ibge).toBe(vectors.golden.saoPaulo.ibgeCodigo);
    expect(getMunicipioPorCodigo(ibge ?? 0)?.uf).toBe(vectors.golden.saoPaulo.uf);
  });

  it('maps golden municipalities across five UFs', () => {
    for (const entry of Object.values(vectors.golden)) {
      expect(getMunicipioIbgePorCodigoTse(entry.codigoTse)).toBe(entry.ibgeCodigo);
      expect(getMunicipioPorCodigo(entry.ibgeCodigo)?.uf).toBe(entry.uf);
    }
  });

  it('reverse lookup returns TSE codes for IBGE municipality', () => {
    const codigos = getCodigosTsePorMunicipio(vectors.golden.saoPaulo.ibgeCodigo);
    expect(codigos).toContain(TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO);
    expect(codigos).toContain(vectors.golden.saoPaulo.codigoTse);
  });

  it('normalizes TSE code without leading zeros', () => {
    expect(getMunicipioIbgePorCodigoTse('71072')).toBe(3550308);
    expect(getMunicipioIbgePorCodigoTse('71072')).toBe(
      getMunicipioIbgePorCodigoTse('071072'.slice(-5)),
    );
  });

  it('returns undefined for unknown TSE code', () => {
    expect(getMunicipioIbgePorCodigoTse('99999')).toBeUndefined();
    expect(getMunicipioIbgePorCodigoTse('')).toBeUndefined();
    expect(getMunicipioIbgePorCodigoTse('abc')).toBeUndefined();
  });

  it('returns empty array for invalid IBGE reverse lookup', () => {
    expect(getCodigosTsePorMunicipio(0)).toEqual([]);
    expect(getCodigosTsePorMunicipio(-1)).toEqual([]);
    expect(getCodigosTsePorMunicipio(1.5)).toEqual([]);
    expect(getCodigosTsePorMunicipio(9999999)).toEqual([]);
  });
});

describe('TSE municipios — national coverage', () => {
  it('lists mappings within expected TSE range', () => {
    const list = getMapeamentoTseIbge();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minMappings);
    expect(list.length).toBeLessThanOrEqual(vectors.maxMappings);
    expect(new Set(list.map((entry) => entry.codigoTse)).size).toBe(list.length);
  });

  it('exposes official TSE endpoint in metadata', () => {
    expect(TSE_MUNICIPIOS_DATA_VERSION.id).toBe('tse-municipios');
    expect(TSE_MUNICIPIOS_DATA_VERSION.endpoints).toContain(TSE_MUNICIPIO_IBGE_ZIP_URL);
    expect(TSE_MUNICIPIOS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(TSE_MUNICIPIOS_DATA_VERSION.contagens.municipios).toBe(getMapeamentoTseIbge().length);
  });
});
