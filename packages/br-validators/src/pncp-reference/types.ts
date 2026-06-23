import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface PncpReferenceItem {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}

export type PncpReferenceTableId =
  | 'modalidades'
  | 'amparos-legais'
  | 'modos-disputa'
  | 'tipos-instrumentos-convocatorios'
  | 'tipos-contrato'
  | 'criterios-julgamento'
  | 'tipos-instrumentos-cobranca'
  | 'fontes-orcamentarias';

export interface PncpReferenceDataVersion {
  id: 'pncp-reference';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: Record<string, number>;
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
