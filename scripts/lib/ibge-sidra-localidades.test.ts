import { describe, expect, it } from 'vitest';

import { parseSidraEstados, parseSidraMunicipios } from './ibge-sidra-localidades.js';

const HEADER = { D1C: 'Município (Código)', D1N: 'Município' };

describe('IBGE SIDRA localidades fallback', () => {
  it('parses municipalities into the /localidades record shape', () => {
    expect(
      parseSidraMunicipios([
        HEADER,
        { D1C: '1100015', D1N: "Alta Floresta D'Oeste - RO" },
        { D1C: '5300108', D1N: 'Brasília - DF' },
      ]),
    ).toEqual([
      { codigo: 1100015, nome: "Alta Floresta D'Oeste", uf: 'RO' },
      { codigo: 5300108, nome: 'Brasília', uf: 'DF' },
    ]);
  });

  it('parses UFs with sigla and região derived from the IBGE code', () => {
    expect(
      parseSidraEstados([
        { D1C: 'Unidade da Federação (Código)', D1N: 'Unidade da Federação' },
        { D1C: '35', D1N: 'São Paulo' },
        { D1C: '11', D1N: 'Rondônia' },
      ]),
    ).toEqual([
      { codigo: 11, sigla: 'RO', nome: 'Rondônia', regiao: { id: 1, nome: 'Norte' } },
      { codigo: 35, sigla: 'SP', nome: 'São Paulo', regiao: { id: 3, nome: 'Sudeste' } },
    ]);
  });

  it('rejects unknown UF codes instead of guessing', () => {
    expect(() => parseSidraEstados([{ D1C: '99', D1N: 'X' }])).toThrow('Unknown IBGE UF code');
  });
});
