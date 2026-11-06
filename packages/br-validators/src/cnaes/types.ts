import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Cnae {
  codigo: string;
  descricao: string;
}

export interface CnaesDataVersion {
  id: 'cnaes';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { cnaes: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
