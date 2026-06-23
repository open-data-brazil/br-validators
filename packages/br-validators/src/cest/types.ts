import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Cest {
  codigo: string;
  descricao: string;
  ncms: readonly string[];
  segmento: string;
}

export interface CestDataVersion {
  id: 'cest';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { cest: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
