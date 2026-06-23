import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Ncm {
  codigo: string;
  descricao: string;
}

export interface NcmDataVersion {
  id: 'ncm';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { ncm: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
