import { describe, expect, it } from 'vitest';
import { IBGE_GOLDEN_MUNICIPIO_SP } from '@br-validators/core/ibge';
import { resolveCatalogDocUrl } from '../lib/reference-data/catalog-docs';
import { FISCAL_MODULES, LOGISTICS_MODULES, TRADE_MODULES } from '../lib/reference-data/govbr-groups';
import { resolveBancoFromInput } from '../lib/reference-data/bancos-lookup';
import { filterMunicipiosByName, getMunicipiosForUf } from '../lib/reference-data/ibge-filter';
import { playgroundRouteKey, resolvePlaygroundRoute } from '../lib/playground-routes';

describe('resolvePlaygroundRoute reference data', () => {
  it('resolves data/ibge and data/bancos', () => {
    expect(resolvePlaygroundRoute('/data/ibge')).toEqual({ kind: 'reference-data', slug: 'data/ibge' });
    expect(resolvePlaygroundRoute('/data/bancos')).toEqual({ kind: 'reference-data', slug: 'data/bancos' });
    expect(resolvePlaygroundRoute('/data/catalog')).toEqual({ kind: 'reference-data', slug: 'data/catalog' });
    expect(resolvePlaygroundRoute('/data/fiscal')).toEqual({ kind: 'reference-data', slug: 'data/fiscal' });
    expect(resolvePlaygroundRoute('/data/trade')).toEqual({ kind: 'reference-data', slug: 'data/trade' });
    expect(resolvePlaygroundRoute('/data/logistics')).toEqual({ kind: 'reference-data', slug: 'data/logistics' });
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

describe('resolveCatalogDocUrl', () => {
  it('prefixes relative docs paths with GitHub base', () => {
    expect(resolveCatalogDocUrl('docs/OFFICIAL-SOURCES.md#moedas')).toBe(
      'https://github.com/AlexandreZanata/br-validators/blob/main/docs/OFFICIAL-SOURCES.md#moedas',
    );
  });

  it('keeps absolute URLs unchanged', () => {
    const url = 'https://example.com/doc';
    expect(resolveCatalogDocUrl(url)).toBe(url);
  });
});

describe('Gov.br reference groups', () => {
  it('resolves fiscal golden natureza juridica', () => {
    const module = FISCAL_MODULES[0];
    expect(module.lookup('2062')?.codigo).toBe('2062');
  });

  it('resolves trade golden moeda BRL', () => {
    const module = TRADE_MODULES.find((entry) => entry.id === 'moedas');
    expect(module?.lookup('BRL')?.codigo).toBe('BRL');
  });

  it('resolves logistics golden port and airport', () => {
    const portos = LOGISTICS_MODULES.find((entry) => entry.id === 'portos');
    const aeroportos = LOGISTICS_MODULES.find((entry) => entry.id === 'aeroportos');
    expect(portos?.lookup('BRSSZ')?.codigo).toBe('BRSSZ');
    expect(aeroportos?.lookup('GRU')?.icao).toBe('SBGR');
  });
});
