/**
 * Portal da Transparência endpoint registry — offline metadata (no live API in core).
 * @see docs/OFFICIAL-SOURCES.md#portal-transparencia
 */

import registryData from './data/endpoints.json';
import type { TransparenciaEndpoint, TransparenciaSnapshotsRegistry } from './types.js';

const registry = registryData as TransparenciaSnapshotsRegistry;
const endpoints: readonly TransparenciaEndpoint[] = registry.endpoints;

export function getTransparenciaRegistry(): TransparenciaSnapshotsRegistry {
  return registry;
}

export function getTransparenciaEndpoints(): readonly TransparenciaEndpoint[] {
  return endpoints;
}

export function getTransparenciaEndpointPorId(id: string): TransparenciaEndpoint | undefined {
  const normalized = id.trim().toLowerCase();
  if (normalized.length === 0) {
    return undefined;
  }
  return endpoints.find((endpoint) => endpoint.id === normalized);
}

export function getTransparenciaEndpointsPorDominio(domain: string): readonly TransparenciaEndpoint[] {
  const normalized = domain.trim().toLowerCase();
  if (normalized.length === 0) {
    return [];
  }
  return endpoints.filter((endpoint) => endpoint.domain === normalized);
}

export function getTransparenciaQueryAdapterEndpoints(): readonly TransparenciaEndpoint[] {
  return endpoints.filter((endpoint) => endpoint.delivery === 'query-adapter');
}
