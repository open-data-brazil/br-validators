import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Cbo {
  codigo: string;
  descricao: string;
}

export interface CboDataVersion {
  id: 'cbo';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { cbo: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
