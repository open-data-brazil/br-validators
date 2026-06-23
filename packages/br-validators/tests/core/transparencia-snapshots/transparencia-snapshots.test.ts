import { describe, expect, it } from 'vitest';

import {
  getTransparenciaEndpointPorId,
  getTransparenciaEndpoints,
  getTransparenciaEndpointsPorDominio,
  getTransparenciaQueryAdapterEndpoints,
  getTransparenciaRegistry,
  normalizeTransparenciaCnpj,
  normalizeTransparenciaCpf,
  TRANSPARENCIA_GOLDEN_CEIS_PATH,
  TRANSPARENCIA_SNAPSHOTS_DATA_VERSION,
  TRANSPARENCIA_SWAGGER_URL,
} from '../../../src/transparencia-snapshots/index.js';
import vectors from '../../vectors/transparencia.official.json';

describe('Transparencia snapshots — official golden vectors', () => {
  it('registers CEIS as query-adapter endpoint', () => {
    const ceis = getTransparenciaEndpointPorId(vectors.golden.ceis.id);
    expect(ceis?.path).toBe(TRANSPARENCIA_GOLDEN_CEIS_PATH);
    expect(ceis?.delivery).toBe(vectors.golden.ceis.delivery);
  });

  it('registers PEP endpoint as query-adapter', () => {
    const peps = getTransparenciaEndpointPorId(vectors.golden.peps.id);
    expect(peps?.path).toBe(vectors.golden.peps.path);
    expect(peps?.delivery).toBe('query-adapter');
  });
});

describe('Transparencia snapshots — registry coverage', () => {
  it('lists endpoints and query-adapter subset', () => {
    const endpoints = getTransparenciaEndpoints();
    expect(endpoints.length).toBeGreaterThanOrEqual(vectors.minEndpoints);
    expect(getTransparenciaQueryAdapterEndpoints().length).toBeGreaterThanOrEqual(
      vectors.minQueryAdapter,
    );
  });

  it('filters endpoints by domain', () => {
    const sanctions = getTransparenciaEndpointsPorDominio('sanctions');
    expect(sanctions.some((endpoint) => endpoint.id === 'ceis')).toBe(true);
    expect(getTransparenciaEndpointsPorDominio('')).toEqual([]);
  });

  it('returns undefined for unknown endpoint id', () => {
    expect(getTransparenciaEndpointPorId('')).toBeUndefined();
    expect(getTransparenciaEndpointPorId('unknown-endpoint')).toBeUndefined();
  });

  it('exposes registry probe flags and adapter package name', () => {
    const registry = getTransparenciaRegistry();
    expect(registry.adapterPackage).toContain('adapters-transparencia');
    expect(typeof registry.swaggerOk).toBe('boolean');
  });
});

describe('Transparencia snapshots — identifier normalization', () => {
  it('normalizes CPF for adapter query via stripCpf', () => {
    expect(normalizeTransparenciaCpf(vectors.golden.cpfQuery.formatted)).toBe(
      vectors.golden.cpfQuery.canonical,
    );
  });

  it('normalizes CNPJ for adapter query via stripCnpj', () => {
    expect(normalizeTransparenciaCnpj(vectors.golden.cnpjQuery.formatted)).toBe(
      vectors.golden.cnpjQuery.canonical,
    );
  });
});

describe('Transparencia snapshots — metadata', () => {
  it('exposes Swagger URL in metadata', () => {
    expect(TRANSPARENCIA_SNAPSHOTS_DATA_VERSION.id).toBe('transparencia-snapshots');
    expect(
      TRANSPARENCIA_SNAPSHOTS_DATA_VERSION.endpoints.some((endpoint) =>
        endpoint.includes(TRANSPARENCIA_SWAGGER_URL),
      ),
    ).toBe(true);
    expect(TRANSPARENCIA_SNAPSHOTS_DATA_VERSION.contagens.endpoints).toBe(
      getTransparenciaEndpoints().length,
    );
  });
});
