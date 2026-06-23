import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export type FeriadoTipo = 'fixo' | 'movel';

export interface FeriadoNacional {
  data: string;
  nome: string;
  tipo: FeriadoTipo;
  baseLegal?: string;
}

export interface FeriadosDataVersion {
  id: 'feriados';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { fixos: number; moveis: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}

export interface ParsedUtcDate {
  year: number;
  month: number;
  day: number;
}
