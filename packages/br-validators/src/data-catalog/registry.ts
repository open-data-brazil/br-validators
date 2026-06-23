import ibgeMetadata from '../ibge/data/metadata.json';
import bancosMetadata from '../bancos/data/metadata.json';
import telefoneDddMetadata from '../core/telefone/data/ddd-metadata.json';
import feriadosMetadata from '../feriados/data/metadata.json';
import cnaesMetadata from '../cnaes/data/metadata.json';
import cfopMetadata from '../cfop/data/metadata.json';
import ncmMetadata from '../ncm/data/metadata.json';
import cboMetadata from '../cbo/data/metadata.json';
import cepFaixaMetadata from '../core/cep/data/faixa-metadata.json';
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
  { id: 'cnaes', metadata: cnaesMetadata as DatasetMetadata },
  { id: 'cfop', metadata: cfopMetadata as DatasetMetadata },
  { id: 'ncm', metadata: ncmMetadata as DatasetMetadata },
  { id: 'cbo', metadata: cboMetadata as DatasetMetadata },
  { id: 'cep-faixas', metadata: cepFaixaMetadata as DatasetMetadata },
];
