import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Banco {
  codigo: string;
  ispb: string;
  nome: string;
  nomeReduzido: string;
  participaCompe: boolean;
}

export interface BancosDataVersion {
  id: 'bancos';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { bancos: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
