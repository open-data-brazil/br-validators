import { describe, expect, it } from 'vitest';
import { generate } from '../../src/generate/index.js';
import { detectCardBrand, validateCartaoCredito } from '../../src/core/cartao-credito/index.js';
import {
  GENERATABLE_CARD_BRANDS,
  isGeneratableCardBrand,
} from '../../src/generate/cartao-credito.js';
import cartaoVectors from '../vectors/cartao-credito.official.json';
import { CARTAO_GOLDEN_VISA } from '../../src/core/cartao-credito/constants.js';

describe('generate(cartao-credito) brand option', () => {
  for (const brand of GENERATABLE_CARD_BRANDS) {
    it(`generates valid ${brand} PAN`, () => {
      for (let seed = 0; seed < 10; seed++) {
        const value = generate('cartao-credito', { brand, seed: 200 + seed });
        expect(validateCartaoCredito(value).ok).toBe(true);
        expect(detectCardBrand(value)).toBe(brand);
      }
    });
  }

  it('formats when masked', () => {
    const formatted = generate('cartao-credito', { brand: 'visa', masked: true, seed: 1 });
    expect(validateCartaoCredito(formatted).ok).toBe(true);
    expect(formatted).toContain(' ');
  });

  it('is seed-reproducible for a brand', () => {
    const first = generate('cartao-credito', { brand: 'mastercard', seed: 99 });
    const second = generate('cartao-credito', { brand: 'mastercard', seed: 99 });
    expect(first).toBe(second);
  });

  it('falls back to official goldens per brand', async () => {
    const { __generateCartaoTesting } = await import('../../src/generate/cartao-credito.js');
    expect(__generateCartaoTesting.fallback('visa')).toBe(cartaoVectors.visa.canonical);
    expect(__generateCartaoTesting.fallback('mastercard')).toBe(cartaoVectors.mastercard.canonical);
    expect(__generateCartaoTesting.fallback('amex')).toBe(cartaoVectors.amex.canonical);
  });

  it('generates without brand option', () => {
    const value = generate('cartao-credito', { seed: 3 });
    expect(validateCartaoCredito(value).ok).toBe(true);
  });

  it('covers internal test hooks', async () => {
    const { __generateCartaoTesting } = await import('../../src/generate/cartao-credito.js');
    const { createRandomSource } = await import('../../src/generate/random.js');
    for (const brand of GENERATABLE_CARD_BRANDS) {
      expect(__generateCartaoTesting.buildBrandPartial(brand).length).toBeGreaterThan(0);
    }
    expect(__generateCartaoTesting.buildRandomPartial()).toHaveLength(15);
    expect(__generateCartaoTesting.generateWithAlwaysWrongBrand('visa', createRandomSource(1))).toBe(
      __generateCartaoTesting.fallback('visa'),
    );
    expect(__generateCartaoTesting.generateWithAlwaysInvalidValidation(createRandomSource(1))).toBe(
      CARTAO_GOLDEN_VISA,
    );
    expect(__generateCartaoTesting.invokeBuildBrandPartialDefault()).toBe('invalid');
    __generateCartaoTesting.touchHookRngMethods();
  });

  it('isGeneratableCardBrand narrows supported brands', () => {
    expect(isGeneratableCardBrand('visa')).toBe(true);
    expect(isGeneratableCardBrand('unknown')).toBe(false);
  });
});
