import { describe, expect, it } from 'vitest';
import { ANATEL_DDDS, IE_SUPPORTED_UFS, validateTelefone } from '@br-validators/core';
import { generateTelefoneDocument } from '../lib/generators/telefone';
import { isTelefoneDddInUf, TELEFONE_DDD_BY_UF } from '../lib/telefone-ddd-by-uf';
import { generateValidDocument } from '../lib/playground-generate';

describe('telefone-ddd-by-uf', () => {
  it('maps every UF to official Anatel DDDs', () => {
    const anatelSet = new Set<string>(ANATEL_DDDS);

    for (const uf of IE_SUPPORTED_UFS) {
      const ddds = TELEFONE_DDD_BY_UF[uf];
      expect(ddds.length).toBeGreaterThan(0);
      for (const ddd of ddds) {
        expect(anatelSet.has(ddd)).toBe(true);
      }
    }
  });
});

describe('telefone generate by state', () => {
  it('uses a DDD from the selected UF', () => {
    const rj = generateTelefoneDocument('RJ', 'celular', false, 7);
    const sp = generateTelefoneDocument('SP', 'celular', false, 7);
    expect(validateTelefone(rj).ok).toBe(true);
    expect(validateTelefone(sp).ok).toBe(true);
    expect(isTelefoneDddInUf(rj.slice(0, 2), 'RJ')).toBe(true);
    expect(isTelefoneDddInUf(sp.slice(0, 2), 'SP')).toBe(true);
  });

  it('respects celular vs fixo format', () => {
    const celular = generateValidDocument('telefone', { uf: 'SP', format: 'celular', masked: false, seed: 3 });
    const fixo = generateValidDocument('telefone', { uf: 'SP', format: 'fixo', masked: false, seed: 3 });
    expect(celular.charAt(2)).toBe('9');
    expect(['2', '3', '4', '5']).toContain(fixo.charAt(2));
  });
});
