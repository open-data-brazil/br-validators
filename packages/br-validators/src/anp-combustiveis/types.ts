import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export const ANP_COMBUSTIVEL_VALUES = [
  'ETHANOL',
  'GASOLINE_REGULAR',
  'GASOLINE_PREMIUM',
  'DIESEL_S500',
  'DIESEL_S10',
  'CNG',
  'LPG_P13',
] as const;

export type AnpCombustivel = (typeof ANP_COMBUSTIVEL_VALUES)[number];

export interface AnpSemanaPesquisa {
  inicio: string;
  fim: string;
}

export interface AnpPrecoMedio {
  semanaInicio: string;
  semanaFim: string;
  uf: string;
  estadoNome: string;
  municipioNome: string;
  municipioIbge: number | null;
  produto: AnpCombustivel;
  postosPesquisados: number;
  unidade: string;
  precoMedio: number;
  precoMinimo: number;
  precoMaximo: number;
  desvioPadrao: number | null;
  coeficienteVariacao: number | null;
}

export interface AnpPrecosMediosQuery {
  uf: string;
  municipio: string;
  produto: AnpCombustivel;
  semanaInicio?: string;
}

export interface AnpCombustiveisDataVersion {
  id: 'anp-combustiveis';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: {
    semanas: number;
    precosMedios: number;
    municipios: number;
    produtos: number;
    ufs: number;
  };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
