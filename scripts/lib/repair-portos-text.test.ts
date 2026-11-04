import { describe, expect, it } from 'vitest';

import type { PortoRecord } from './parse-portos-xlsx.js';
import { repairPortosText } from './repair-portos-text.js';
import { buildRepairDictionary, repairReplacementChars } from './repair-replacement-chars.js';

const R = '�';

function porto(overrides: Partial<PortoRecord>): PortoRecord {
  return {
    codigo: 'BR004',
    nome: 'Porto',
    tipo: 'IP4',
    situacao: 'Planejado',
    uf: 'AM',
    municipioNome: 'Porto',
    municipioIbge: null,
    latitude: null,
    longitude: null,
    ...overrides,
  };
}

describe('repairReplacementChars', () => {
  const dictionary = buildRepairDictionary(['operação', 'público', 'são', 'sôo'], ['são']);

  it('restores accented letters by skeleton match, keeping case', () => {
    expect(repairReplacementChars(`Opera${R}${R}o P${R}blico`, dictionary).text).toBe('Operação Público');
    expect(repairReplacementChars(`OPERA${R}${R}O`, dictionary).text).toBe('OPERAÇÃO');
  });

  it('uses the preferred word when the skeleton is ambiguous', () => {
    expect(repairReplacementChars(`S${R}o Paulo`, dictionary).text).toBe('São Paulo');
  });

  it('leaves unknown tokens untouched and reports them', () => {
    const result = repairReplacementChars(`Sabb${R}`, dictionary);
    expect(result.text).toBe(`Sabb${R}`);
    expect(result.unresolved).toEqual([`Sabb${R}`]);
  });

  it('drops a trailing U+FFFD only when the rest is a known word', () => {
    const withAscii = buildRepairDictionary(['janeiro', 'itajaí']);
    expect(repairReplacementChars(`Rio de Janeiro${R}`, withAscii).text).toBe('Rio de Janeiro');
    expect(repairReplacementChars(`Itaja${R}${R}`, withAscii).text).toBe('Itajaí');
    expect(repairReplacementChars(`Jar${R}`, withAscii).unresolved).toEqual([`Jar${R}`]);
  });

  it('maps lone U+FFFD to punctuation instead of guessing a letter', () => {
    const operacao = buildRepairDictionary(['operação', 'navegação']);
    expect(repairReplacementChars(`Santos ${R}`, operacao).text).toBe('Santos');
    expect(repairReplacementChars(`Porto Velho ${R} Rio Candeias`, operacao).text).toBe('Porto Velho – Rio Candeias');
    expect(repairReplacementChars(`Apoio ${R} navega${R}${R}o`, operacao).text).toBe('Apoio à navegação');
  });

  it('is a no-op for clean text', () => {
    expect(repairReplacementChars('Santos', dictionary)).toEqual({ text: 'Santos', unresolved: [] });
  });
});

describe('repairPortosText', () => {
  it('restores municipioNome from IBGE and repairs free-text fields', () => {
    const { portos, unresolved } = repairPortosText(
      [
        porto({
          nome: `Alvar${R}es`,
          tipo: `Instala${R}${R}o Portu${R}ria`,
          situacao: `Em opera${R}${R}o`,
          municipioNome: `Alvar${R}es`,
          municipioIbge: 1300020,
        }),
      ],
      [{ codigo: 1300020, nome: 'Alvarães' }],
    );
    expect(portos[0]).toMatchObject({
      nome: 'Alvarães',
      tipo: 'Instalação Portuária',
      situacao: 'Em operação',
      municipioNome: 'Alvarães',
    });
    expect(unresolved).toEqual([]);
  });
});
