import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Moeda {
  codigo: string;
  nome: string;
  simbolo: string | null;
  tipoBacen: 'A' | 'B' | null;
}

export interface MoedasDataVersion {
  id: 'moedas';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { moedas: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
