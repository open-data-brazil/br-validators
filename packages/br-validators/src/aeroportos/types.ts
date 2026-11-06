import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Aeroporto {
  iata: string | null;
  icao: string;
  nome: string;
  uf: string;
  municipioIbge: number | null;
  municipioNome: string | null;
}

export interface AeroportosDataVersion {
  id: 'aeroportos';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { aeroportos: number; comIata: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
