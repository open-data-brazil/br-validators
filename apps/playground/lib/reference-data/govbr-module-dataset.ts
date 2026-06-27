import type { GovBrModuleId } from './govbr-groups';

const MODULE_TO_DATASET: Partial<Record<GovBrModuleId, string>> = {
  naturezaJuridica: 'natureza-juridica',
  nbs: 'nbs',
  cest: 'cest',
  cnae: 'cnaes',
  cfop: 'cfop',
  ncm: 'ncm',
  cst: 'cst',
  csosn: 'csosn',
  cbo: 'cbo',
  nfeCuf: 'nfe-cuf',
  issMunicipal: 'iss-municipal',
  moedas: 'moedas',
  paisesBacen: 'paises-bacen',
  incoterms: 'incoterms',
  portos: 'portos',
  aeroportos: 'aeroportos',
};

export function resolveGovBrModuleDatasetId(moduleId: GovBrModuleId): string | undefined {
  return MODULE_TO_DATASET[moduleId];
}
