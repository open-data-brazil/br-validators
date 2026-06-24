import ibgeMetadata from '../ibge/data/metadata.json';
import bancosMetadata from '../bancos/data/metadata.json';
import aeroportosMetadata from '../aeroportos/data/metadata.json';
import tseMunicipiosMetadata from '../tse-municipios/data/metadata.json';
import moedasMetadata from '../moedas/data/metadata.json';
import paisesBacenMetadata from '../paises-bacen/data/metadata.json';
import incotermsMetadata from '../incoterms/data/metadata.json';
import telefoneDddMetadata from '../core/telefone/data/ddd-metadata.json';
import feriadosMetadata from '../feriados/data/metadata.json';
import cnaesMetadata from '../cnaes/data/metadata.json';
import cfopMetadata from '../cfop/data/metadata.json';
import naturezaJuridicaMetadata from '../natureza-juridica/data/metadata.json';
import nbsMetadata from '../nbs/data/metadata.json';
import cestMetadata from '../cest/data/metadata.json';
import ncmMetadata from '../ncm/data/metadata.json';
import cboMetadata from '../cbo/data/metadata.json';
import cepFaixaMetadata from '../core/cep/data/faixa-metadata.json';
import portosMetadata from '../portos/data/metadata.json';
import anpCombustiveisMetadata from '../anp-combustiveis/data/metadata.json';
import pncpReferenceMetadata from '../pncp-reference/data/metadata.json';
import transparenciaSnapshotsMetadata from '../transparencia-snapshots/data/metadata.json';
import type { DatasetMetadata } from './types.js';

export interface DatasetRegistryEntry {
  id: string;
  metadata: DatasetMetadata;
}

export const DATASET_REGISTRY: readonly DatasetRegistryEntry[] = [
  { id: 'ibge', metadata: ibgeMetadata as DatasetMetadata },
  { id: 'bancos', metadata: bancosMetadata as DatasetMetadata },
  { id: 'aeroportos', metadata: aeroportosMetadata as DatasetMetadata },
  { id: 'tse-municipios', metadata: tseMunicipiosMetadata as DatasetMetadata },
  { id: 'moedas', metadata: moedasMetadata as DatasetMetadata },
  { id: 'paises-bacen', metadata: paisesBacenMetadata as DatasetMetadata },
  { id: 'incoterms', metadata: incotermsMetadata as DatasetMetadata },
  { id: 'telefone-ddd', metadata: telefoneDddMetadata as DatasetMetadata },
  { id: 'feriados', metadata: feriadosMetadata as DatasetMetadata },
  { id: 'cnaes', metadata: cnaesMetadata as DatasetMetadata },
  { id: 'cfop', metadata: cfopMetadata as DatasetMetadata },
  { id: 'natureza-juridica', metadata: naturezaJuridicaMetadata as DatasetMetadata },
  { id: 'nbs', metadata: nbsMetadata as DatasetMetadata },
  { id: 'cest', metadata: cestMetadata as DatasetMetadata },
  { id: 'ncm', metadata: ncmMetadata as DatasetMetadata },
  { id: 'cbo', metadata: cboMetadata as DatasetMetadata },
  { id: 'cep-faixas', metadata: cepFaixaMetadata as DatasetMetadata },
  { id: 'portos', metadata: portosMetadata as DatasetMetadata },
  { id: 'anp-combustiveis', metadata: anpCombustiveisMetadata as DatasetMetadata },
  { id: 'pncp-reference', metadata: pncpReferenceMetadata as DatasetMetadata },
  { id: 'transparencia-snapshots', metadata: transparenciaSnapshotsMetadata as DatasetMetadata },
];
