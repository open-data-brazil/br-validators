import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export type TransparenciaDeliveryMode = 'query-adapter' | 'bulk-embed-candidate' | 'out-of-scope';

export interface TransparenciaEndpoint {
  id: string;
  path: string;
  domain: string;
  delivery: TransparenciaDeliveryMode;
  description: string;
}

export interface TransparenciaSnapshotsRegistry {
  capturadoEm: string;
  swaggerOk: boolean;
  openapiOk: boolean;
  cadastroUrl: string;
  adapterPackage: string;
  endpoints: readonly TransparenciaEndpoint[];
}

export interface TransparenciaSnapshotsDataVersion {
  id: 'transparencia-snapshots';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { endpoints: number; queryAdapter: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
