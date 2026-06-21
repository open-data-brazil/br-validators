import { describe, expect, it } from 'vitest';
import {
  BOLETO_GOLDEN_LINHA_MASKED,
  BOLETO_GOLDEN_LINHA_STRIPPED,
  BOLETO_LINHA_LENGTH,
} from '../../../src/core/boleto/constants.js';
import { applyLinhaDigitavelMask, formatLinhaDigitavel } from '../../../src/core/boleto/mask.js';

describe('applyLinhaDigitavelMask', () => {
  it('formats golden linha stripped', () => {
    expect(applyLinhaDigitavelMask(BOLETO_GOLDEN_LINHA_STRIPPED)).toBe(BOLETO_GOLDEN_LINHA_MASKED);
  });

  it('formatLinhaDigitavel delegates to applyLinhaDigitavelMask', () => {
    expect(formatLinhaDigitavel(BOLETO_GOLDEN_LINHA_STRIPPED)).toBe(BOLETO_GOLDEN_LINHA_MASKED);
  });

  it('throws on invalid length', () => {
    expect(() => {
      applyLinhaDigitavelMask('123');
    }).toThrow(/exactly/);
  });
});

describe('applyLinhaDigitavelMask length guard', () => {
  it('expects BOLETO_LINHA_LENGTH digits', () => {
    expect(BOLETO_GOLDEN_LINHA_STRIPPED.length).toBe(BOLETO_LINHA_LENGTH);
  });
});
