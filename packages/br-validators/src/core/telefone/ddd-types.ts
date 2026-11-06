import type { DatasetChanges, DatasetVerification } from '../../data-catalog/types.js';

export interface DddInfo {
  ddd: string;
  uf: string;
  regiao: string;
  municipios: readonly string[];
}

export interface TelefoneDddDataVersion {
  id: 'telefone-ddd';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { ddds: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
