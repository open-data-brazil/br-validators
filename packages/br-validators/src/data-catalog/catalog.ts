import { DATASET_REGISTRY } from './registry.js';
import type { DataCatalogVersion, DatasetMetadata } from './types.js';

export function getDataCatalog(): readonly DatasetMetadata[] {
  return DATASET_REGISTRY.map((entry) => entry.metadata);
}

export function getDatasetMetadata(id: string): DatasetMetadata | undefined {
  return DATASET_REGISTRY.find((entry) => entry.id === id)?.metadata;
}

export const DATA_CATALOG_VERSION: DataCatalogVersion = {
  totalDatasets: DATASET_REGISTRY.length,
};
