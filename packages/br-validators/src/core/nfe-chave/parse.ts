import { NFE_CHAVE_LENGTH } from './constants.js';

export type NfeChaveParts = {
  cUF: string;
  aamm: string;
  cnpj: string;
  mod: string;
  serie: string;
  nNF: string;
  tpEmis: string;
  cNF: string;
  cDV: string;
};

export function parseNfeChaveParts(stripped: string): NfeChaveParts | null {
  if (stripped.length !== NFE_CHAVE_LENGTH) {
    return null;
  }

  return {
    cUF: stripped.slice(0, 2),
    aamm: stripped.slice(2, 6),
    cnpj: stripped.slice(6, 20),
    mod: stripped.slice(20, 22),
    serie: stripped.slice(22, 25),
    nNF: stripped.slice(25, 34),
    tpEmis: stripped.slice(34, 35),
    cNF: stripped.slice(35, 43),
    cDV: stripped.slice(43, 44),
  };
}
