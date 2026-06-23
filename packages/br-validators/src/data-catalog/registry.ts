import ibgeMetadata from '../ibge/data/metadata.json';
import bancosMetadata from '../bancos/data/metadata.json';
import telefoneDddMetadata from '../core/telefone/data/ddd-metadata.json';
import feriadosMetadata from '../feriados/data/metadata.json';
import type { DatasetMetadata } from './types.js';

export interface DatasetRegistryEntry {
  id: string;
  metadata: DatasetMetadata;
}

export const DATASET_REGISTRY: readonly DatasetRegistryEntry[] = [
  { id: 'ibge', metadata: ibgeMetadata as DatasetMetadata },
  { id: 'bancos', metadata: bancosMetadata as DatasetMetadata },
  { id: 'telefone-ddd', metadata: telefoneDddMetadata as DatasetMetadata },
  { id: 'feriados', metadata: feriadosMetadata as DatasetMetadata },
];
