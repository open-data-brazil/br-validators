import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Porto {
  codigo: string;
  nome: string;
  tipo: string;
  situacao: string;
  uf: string;
  municipioNome: string;
  municipioIbge: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PortosDataVersion {
  id: 'portos';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { portos: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
