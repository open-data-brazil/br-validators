import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface PaisBacen {
  codigo: string;
  nome: string;
}

export interface PaisesBacenDataVersion {
  id: 'paises-bacen';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { paises: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
