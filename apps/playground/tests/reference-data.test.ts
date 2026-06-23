import { describe, expect, it } from 'vitest';
import { IBGE_GOLDEN_MUNICIPIO_SP } from '@br-validators/core/ibge';
import { resolveBancoFromInput } from '../lib/reference-data/bancos-lookup';
import { filterMunicipiosByName, getMunicipiosForUf } from '../lib/reference-data/ibge-filter';
import { playgroundRouteKey, resolvePlaygroundRoute } from '../lib/playground-routes';

describe('resolvePlaygroundRoute reference data', () => {
  it('resolves data/ibge and data/bancos', () => {
    expect(resolvePlaygroundRoute('/data/ibge')).toEqual({ kind: 'reference-data', slug: 'data/ibge' });
    expect(resolvePlaygroundRoute('/data/bancos')).toEqual({ kind: 'reference-data', slug: 'data/bancos' });
    expect(resolvePlaygroundRoute('/data/catalog')).toEqual({ kind: 'reference-data', slug: 'data/catalog' });
  });

  it('builds reference-data route keys', () => {
    expect(playgroundRouteKey({ kind: 'reference-data', slug: 'data/ibge' })).toBe('reference-data:data/ibge');
  });
});

describe('IBGE reference data helpers', () => {
  it('returns municipalities for SP', () => {
    const municipios = getMunicipiosForUf('SP');
    expect(municipios.length).toBeGreaterThan(0);
  });

  it('filters municipios by name for SP', () => {
    const municipios = getMunicipiosForUf('SP');
    const filtered = filterMunicipiosByName(municipios, 'São Paulo');
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some((m) => m.codigo === IBGE_GOLDEN_MUNICIPIO_SP)).toBe(true);
  });
});

describe('Bancos reference data helpers', () => {
  it('resolves COMPE 001 to Banco do Brasil', () => {
    const banco = resolveBancoFromInput('001');
    expect(banco?.codigo).toBe('001');
    expect(banco?.nome).toContain('Brasil');
  });
});
