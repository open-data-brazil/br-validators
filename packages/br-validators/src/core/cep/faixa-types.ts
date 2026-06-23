import type { DatasetChanges, DatasetVerification } from '../../data-catalog/types.js';

export interface CepFaixa {
  prefixo: string;
  uf: string;
  codigoIbge: number;
  cidade: string;
}

export interface CepFaixaDataVersion {
  id: 'cep-faixas';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { faixas: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
