import { describe, expect, it } from 'vitest';
import { generate } from '../../src/generate/index.js';
import { IE_SUPPORTED_UFS, validateInscricaoEstadual } from '../../src/core/inscricao-estadual/index.js';
import ieSpVectors from '../vectors/ie.sp.official.json';

describe('generate(inscricao-estadual)', () => {
  it('requires uf option', () => {
    expect(() => generate('inscricao-estadual', { seed: 1 })).toThrow(/UF is required/);
    expect(() => generate('inscricao-estadual', { seed: 1, masked: true, uf: 'SP' })).not.toThrow();
  });

  it('generates valid IE for every UF', () => {
    for (const uf of IE_SUPPORTED_UFS) {
      for (let seed = 0; seed < 5; seed++) {
        const value = generate('inscricao-estadual', { uf, seed: 100 + seed });
        expect(validateInscricaoEstadual(value, { uf }).ok).toBe(true);
      }
    }
  });

  it('is seed-reproducible per UF', () => {
    const first = generate('inscricao-estadual', { uf: 'RJ', seed: 42 });
    const second = generate('inscricao-estadual', { uf: 'RJ', seed: 42 });
    expect(first).toBe(second);
  });

  it('formats SP IE when masked', () => {
    const formatted = generate('inscricao-estadual', { uf: 'SP', masked: true, seed: 7 });
    expect(validateInscricaoEstadual(formatted, { uf: 'SP' }).ok).toBe(true);
    expect(formatted).toContain('.');
    expect(formatted).not.toBe(ieSpVectors.golden.stripped);
  });

  it('generates different values for different seeds', () => {
    const a = generate('inscricao-estadual', { uf: 'MG', seed: 1 });
    const b = generate('inscricao-estadual', { uf: 'MG', seed: 2 });
    expect(a).not.toBe(b);
  });

  it('falls back to official golden when validation exhausts', async () => {
    const { __generateIeTesting } = await import('../../src/generate/inscricao-estadual.js');
    const { createRandomSource } = await import('../../src/generate/random.js');
    expect(__generateIeTesting.generateWithAlwaysInvalidValidation('RJ', createRandomSource(1))).toBe(
      __generateIeTesting.fallback('RJ'),
    );
  });

  it('isSupportedGenerateUf narrows supported codes', async () => {
    const { isSupportedGenerateUf } = await import('../../src/generate/inscricao-estadual.js');
    expect(isSupportedGenerateUf('SP')).toBe(true);
    expect(isSupportedGenerateUf('XX')).toBe(false);
  });
});
