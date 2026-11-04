/**
 * IBGE localidades via SIDRA (apisidra.ibge.gov.br) — official IBGE fallback.
 *
 * servicodados.ibge.gov.br drops TCP connections from GitHub-hosted runners, while
 * apisidra.ibge.gov.br (also IBGE, behind a CDN) answers. Table 6579 (population
 * estimate) lists every municipality (n6) and UF (n3) with its IBGE code; names come
 * as "Alta Floresta D'Oeste - RO" and match /localidades byte for byte.
 */

import { NFE_CUF_TABLE } from './nfe-cuf-table.js';

export const IBGE_SIDRA_ESTADOS_URL = 'https://apisidra.ibge.gov.br/values/t/6579/n3/all/v/9324/p/last';
export const IBGE_SIDRA_MUNICIPIOS_URL = 'https://apisidra.ibge.gov.br/values/t/6579/n6/all/v/9324/p/last';

/** First digit of the IBGE UF code is the macro-region (IBGE regional division). */
const REGIOES: Record<string, { id: number; nome: string }> = {
  '1': { id: 1, nome: 'Norte' },
  '2': { id: 2, nome: 'Nordeste' },
  '3': { id: 3, nome: 'Sudeste' },
  '4': { id: 4, nome: 'Sul' },
  '5': { id: 5, nome: 'Centro-Oeste' },
};

export interface SidraRow {
  D1C: string;
  D1N: string;
}

export interface SidraEstado {
  codigo: number;
  sigla: string;
  nome: string;
  regiao: { id: number; nome: string };
}

export interface SidraMunicipio {
  codigo: number;
  nome: string;
  uf: string;
}

/** SIDRA returns a header row first; data rows have numeric `D1C`. */
function dataRows(payload: readonly SidraRow[]): SidraRow[] {
  return payload.filter((row) => /^\d+$/u.test(row.D1C));
}

export function parseSidraEstados(payload: readonly SidraRow[]): SidraEstado[] {
  const siglaPorCodigo = new Map(NFE_CUF_TABLE.map((row) => [row.codigo, row.uf]));
  return dataRows(payload)
    .map((row) => {
      const sigla = siglaPorCodigo.get(row.D1C);
      const regiao = REGIOES[row.D1C.charAt(0)] as { id: number; nome: string } | undefined;
      if (sigla === undefined || regiao === undefined) {
        throw new Error(`Unknown IBGE UF code from SIDRA: ${row.D1C}`);
      }
      return { codigo: Number(row.D1C), sigla, nome: row.D1N.trim(), regiao };
    })
    .sort((a, b) => a.codigo - b.codigo);
}

export function parseSidraMunicipios(payload: readonly SidraRow[]): SidraMunicipio[] {
  return dataRows(payload)
    .map((row) => {
      const separator = row.D1N.lastIndexOf(' - ');
      if (separator === -1) {
        throw new Error(`Unexpected SIDRA municipality label: ${row.D1N}`);
      }
      return {
        codigo: Number(row.D1C),
        nome: row.D1N.slice(0, separator).trim(),
        uf: row.D1N.slice(separator + 3).trim(),
      };
    })
    .sort((a, b) => a.codigo - b.codigo);
}
