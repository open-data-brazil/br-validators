import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Incoterm {
  codigo: string;
  nome: string;
  edicao: '2020';
}

export interface IncotermsDataVersion {
  id: 'incoterms';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { incoterms: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
