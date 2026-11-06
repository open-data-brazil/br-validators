import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface NaturezaJuridica {
  codigo: string;
  descricao: string;
}

export interface NaturezaJuridicaDataVersion {
  id: 'natureza-juridica';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { naturezas: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
