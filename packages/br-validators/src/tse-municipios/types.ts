import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface TseMunicipioMapping {
  codigoTse: string;
  ibgeCodigo: number;
  uf: string;
  nome: string;
}

export interface TseMunicipiosDataVersion {
  id: 'tse-municipios';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { municipios: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
