import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Nbs {
  codigo: string;
  descricao: string;
}

export interface NbsDataVersion {
  id: 'nbs';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { nbs: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
