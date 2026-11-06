import { describe, expect, it } from 'vitest';
import { generate } from '../../src/generate/index.js';
import { IE_SUPPORTED_UFS } from '../../src/core/inscricao-estadual/constants.js';
import { validateTituloEleitor } from '../../src/core/titulo-eleitor/index.js';
import { resolveTituloEleitorUfCode } from '../../src/generate/titulo-eleitor.js';
import tituloVectors from '../vectors/titulo-eleitor.official.json';

describe('generate(titulo-eleitor)', () => {
  it('requires uf option', () => {
    expect(() => generate('titulo-eleitor', { seed: 1 })).toThrow(/UF is required/);
  });

  it('generates valid titulo for every UF', () => {
    for (const uf of IE_SUPPORTED_UFS) {
      for (let seed = 0; seed < 5; seed++) {
        const value = generate('titulo-eleitor', { uf, seed: 100 + seed });
        const result = validateTituloEleitor(value);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.uf).toBe(uf);
        }
      }
    }
  });

  it('embeds the TSE electoral code for the selected UF', () => {
    const value = generate('titulo-eleitor', { uf: 'RJ', seed: 7 });
    const ufCode = resolveTituloEleitorUfCode('RJ');
    expect(value.slice(8, 10)).toBe(String(ufCode).padStart(2, '0'));
  });

  it('is seed-reproducible per UF', () => {
    const first = generate('titulo-eleitor', { uf: 'SC', seed: 42 });
    const second = generate('titulo-eleitor', { uf: 'SC', seed: 42 });
    expect(first).toBe(second);
  });

  it('formats when masked', () => {
    const formatted = generate('titulo-eleitor', { uf: 'SC', masked: true, seed: 3 });
    expect(validateTituloEleitor(formatted).ok).toBe(true);
    expect(formatted).toContain(' ');
  });

  it('falls back when validation exhausts', async () => {
    const { __generateTituloTesting } = await import('../../src/generate/titulo-eleitor.js');
    const { createRandomSource } = await import('../../src/generate/random.js');
    expect(__generateTituloTesting.generateWithAlwaysInvalidValidation('MG', createRandomSource(1))).toBe(
      __generateTituloTesting.fallback('MG'),
    );
  });

  it('uses official SP golden in fallback map', async () => {
    const { __generateTituloTesting } = await import('../../src/generate/titulo-eleitor.js');
    expect(__generateTituloTesting.fallback('SP')).toBe(tituloVectors.spSpecial.canonical);
  });

  it('isSupportedTituloGenerateUf narrows supported codes', async () => {
    const { isSupportedTituloGenerateUf } = await import('../../src/generate/titulo-eleitor.js');
    expect(isSupportedTituloGenerateUf('RJ')).toBe(true);
    expect(isSupportedTituloGenerateUf('XX')).toBe(false);
  });
});
