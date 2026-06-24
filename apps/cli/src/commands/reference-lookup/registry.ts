import {
  CEST_DATA_VERSION,
  getCestPorCodigo,
  type Cest,
} from '@br-validators/core/cest';
import {
  INCOTERMS_DATA_VERSION,
  getIncotermPorCodigo,
  type Incoterm,
} from '@br-validators/core/incoterms';
import {
  MOEDAS_DATA_VERSION,
  getMoedaPorCodigo,
  type Moeda,
} from '@br-validators/core/moedas';
import {
  NATUREZA_JURIDICA_DATA_VERSION,
  getNaturezaJuridicaPorCodigo,
  type NaturezaJuridica,
} from '@br-validators/core/natureza-juridica';
import { NBS_DATA_VERSION, getNbsPorCodigo, type Nbs } from '@br-validators/core/nbs';
import {
  PAISES_BACEN_DATA_VERSION,
  getPaisPorCodigoBacen,
  type PaisBacen,
} from '@br-validators/core/paises-bacen';
import {
  AEROPORTOS_DATA_VERSION,
  getAeroportoPorIata,
  getAeroportoPorIcao,
  type Aeroporto,
} from '@br-validators/core/aeroportos';
import { PORTOS_DATA_VERSION, getPortoPorCodigo, type Porto } from '@br-validators/core/portos';
import {
  CNAES_DATA_VERSION,
  getCnaePorCodigo,
  type Cnae,
} from '@br-validators/core/cnaes';
import {
  CFOP_DATA_VERSION,
  getCfopPorCodigo,
  type Cfop,
} from '@br-validators/core/cfop';
import { NCM_DATA_VERSION, getNcmPorCodigo, type Ncm } from '@br-validators/core/ncm';
import { CBO_DATA_VERSION, getCboPorCodigo, type Cbo } from '@br-validators/core/cbo';

export const REFERENCE_LOOKUP_COMMANDS = [
  'natureza-juridica',
  'nbs',
  'cest',
  'cnae',
  'cfop',
  'ncm',
  'cbo',
  'moedas',
  'paises-bacen',
  'incoterms',
  'portos',
  'aeroportos',
] as const;

export const REFERENCE_SEARCH_COMMANDS = ['cnae', 'cfop', 'ncm', 'cbo'] as const;

export type ReferenceSearchCommand = (typeof REFERENCE_SEARCH_COMMANDS)[number];

export type ReferenceLookupCommand = (typeof REFERENCE_LOOKUP_COMMANDS)[number];

export type ReferenceLookupResult =
  | NaturezaJuridica
  | Nbs
  | Cest
  | Cnae
  | Cfop
  | Ncm
  | Cbo
  | Moeda
  | PaisBacen
  | Incoterm
  | Porto
  | Aeroporto;

export interface ReferenceLookupModule {
  command: ReferenceLookupCommand;
  description: string;
  resultKey: string;
  capturadoEm: string;
  lookup: (input: string) => ReferenceLookupResult | undefined;
  formatHuman: (result: ReferenceLookupResult) => string;
}

function lookupAeroporto(input: string): Aeroporto | undefined {
  const normalized = input.trim().toUpperCase();
  if (/^[A-Z0-9]{3}$/.test(normalized)) {
    return getAeroportoPorIata(normalized);
  }
  if (/^[A-Z]{4}$/.test(normalized)) {
    return getAeroportoPorIcao(normalized);
  }
  return undefined;
}

export const REFERENCE_LOOKUP_MODULES: Record<ReferenceLookupCommand, ReferenceLookupModule> = {
  'natureza-juridica': {
    command: 'natureza-juridica',
    description: 'RFB legal nature codes — offline lookup',
    resultKey: 'naturezaJuridica',
    capturadoEm: NATUREZA_JURIDICA_DATA_VERSION.capturadoEm,
    lookup: (input) => getNaturezaJuridicaPorCodigo(input),
    formatHuman: (result) => {
      const row = result as NaturezaJuridica;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  nbs: {
    command: 'nbs',
    description: 'NFSe NBS service codes — offline lookup',
    resultKey: 'nbs',
    capturadoEm: NBS_DATA_VERSION.capturadoEm,
    lookup: (input) => getNbsPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Nbs;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  cest: {
    command: 'cest',
    description: 'CONFAZ CEST ST codes — offline lookup',
    resultKey: 'cest',
    capturadoEm: CEST_DATA_VERSION.capturadoEm,
    lookup: (input) => getCestPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Cest;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  cnae: {
    command: 'cnae',
    description: 'IBGE CNAE 2.3 subclasses — offline lookup',
    resultKey: 'cnae',
    capturadoEm: CNAES_DATA_VERSION.capturadoEm,
    lookup: (input) => getCnaePorCodigo(input),
    formatHuman: (result) => {
      const row = result as Cnae;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  cfop: {
    command: 'cfop',
    description: 'CONFAZ CFOP fiscal operations — offline lookup',
    resultKey: 'cfop',
    capturadoEm: CFOP_DATA_VERSION.capturadoEm,
    lookup: (input) => getCfopPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Cfop;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  ncm: {
    command: 'ncm',
    description: 'Siscomex NCM Mercosur codes — offline lookup',
    resultKey: 'ncm',
    capturadoEm: NCM_DATA_VERSION.capturadoEm,
    lookup: (input) => getNcmPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Ncm;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  cbo: {
    command: 'cbo',
    description: 'MTE CBO 2002 occupations — offline lookup',
    resultKey: 'cbo',
    capturadoEm: CBO_DATA_VERSION.capturadoEm,
    lookup: (input) => getCboPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Cbo;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  moedas: {
    command: 'moedas',
    description: 'ISO 4217 + Bacen PTAX currencies — offline lookup',
    resultKey: 'moeda',
    capturadoEm: MOEDAS_DATA_VERSION.capturadoEm,
    lookup: (input) => getMoedaPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Moeda;
      const symbol = row.simbolo ?? '—';
      return `${row.codigo} — ${row.nome} (${symbol})`;
    },
  },
  'paises-bacen': {
    command: 'paises-bacen',
    description: 'NF-e Bacen country codes — offline lookup',
    resultKey: 'pais',
    capturadoEm: PAISES_BACEN_DATA_VERSION.capturadoEm,
    lookup: (input) => getPaisPorCodigoBacen(input),
    formatHuman: (result) => {
      const row = result as PaisBacen;
      return `${row.codigo} — ${row.nome}`;
    },
  },
  incoterms: {
    command: 'incoterms',
    description: 'ICC Incoterms 2020 — offline lookup',
    resultKey: 'incoterm',
    capturadoEm: INCOTERMS_DATA_VERSION.capturadoEm,
    lookup: (input) => getIncotermPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Incoterm;
      return `${row.codigo} — ${row.nome} (${row.edicao})`;
    },
  },
  portos: {
    command: 'portos',
    description: 'ANTAQ port installations — offline lookup',
    resultKey: 'porto',
    capturadoEm: PORTOS_DATA_VERSION.capturadoEm,
    lookup: (input) => getPortoPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Porto;
      return `${row.codigo} — ${row.nome} (${row.uf})`;
    },
  },
  aeroportos: {
    command: 'aeroportos',
    description: 'ANAC public aerodromos — offline lookup by IATA or ICAO',
    resultKey: 'aeroporto',
    capturadoEm: AEROPORTOS_DATA_VERSION.capturadoEm,
    lookup: lookupAeroporto,
    formatHuman: (result) => {
      const row = result as Aeroporto;
      const iata = row.iata ?? '—';
      return `${iata}/${row.icao} — ${row.nome} (${row.uf})`;
    },
  },
};

export function isReferenceLookupCommand(value: string): value is ReferenceLookupCommand {
  return (REFERENCE_LOOKUP_COMMANDS as readonly string[]).includes(value);
}

export function isReferenceSearchCommand(value: string): value is ReferenceSearchCommand {
  return (REFERENCE_SEARCH_COMMANDS as readonly string[]).includes(value);
}
