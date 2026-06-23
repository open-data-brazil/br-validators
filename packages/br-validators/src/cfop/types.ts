import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Cfop {
  codigo: string;
  descricao: string;
}

export interface CfopDataVersion {
  id: 'cfop';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { cfop: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
