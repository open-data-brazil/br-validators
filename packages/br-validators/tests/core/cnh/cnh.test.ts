import { describe, expect, it } from 'vitest';
import {
  computeCnhCheckDigits,
  computeCnhFirstCheckDigit,
  computeCnhSecondCheckDigit,
} from '../../../src/core/cnh/check-digits.js';
import {
  CNH_GOLDEN_DISCOUNT_CASE,
  CNH_GOLDEN_PRIMARY,
  CNH_GOLDEN_PRIMARY_DECORATED_INPUT,
  CNH_GOLDEN_SECONDARY,
  CNH_OFFICIAL_SOURCE_URL,
  CNH_SENATRAN_VALIDAR_URL,
} from '../../../src/core/cnh/constants.js';
import { applyCnhCanonicalFormat } from '../../../src/core/cnh/mask.js';
import { isValidCnh, validateCnh } from '../../../src/core/cnh/index.js';
import { stripCnh } from '../../../src/strip/cnh.js';
import { formatCnh } from '../../../src/format/cnh.js';
import vectors from '../../vectors/cnh.official.json';

describe('CNH golden vectors — CONTRAN / SENATRAN', () => {
  it('validates official primary vector', () => {
    expect(isValidCnh(CNH_GOLDEN_PRIMARY)).toBe(true);
    expect(isValidCnh(vectors.primary.officialFormatted)).toBe(true);
    const result = validateCnh(CNH_GOLDEN_PRIMARY);
    expect(result).toEqual({
      ok: true,
      value: CNH_GOLDEN_PRIMARY,
      format: 'numeric',
    });
  });

  it('validates secondary and discount-case vectors', () => {
    expect(isValidCnh(CNH_GOLDEN_SECONDARY)).toBe(true);
    expect(isValidCnh(vectors.secondary.officialFormatted)).toBe(true);
    expect(isValidCnh(CNH_GOLDEN_DISCOUNT_CASE)).toBe(true);
    expect(isValidCnh(vectors.discountCase.officialFormatted)).toBe(true);
  });

  it('accepts CPF-style decorated input after strip', () => {
    expect(isValidCnh(vectors.primary.cpfStyleDecoratedInput)).toBe(true);
  });

  it('formats primary as official 11 contiguous digits', () => {
    expect(formatCnh(CNH_GOLDEN_PRIMARY)).toEqual({
      ok: true,
      formatted: vectors.primary.officialFormatted,
    });
    expect(formatCnh(vectors.primary.cpfStyleDecoratedInput)).toEqual({
      ok: true,
      formatted: CNH_GOLDEN_PRIMARY,
    });
  });

  it('exports official source URLs', () => {
    expect(CNH_OFFICIAL_SOURCE_URL).toBe(vectors.url);
    expect(CNH_SENATRAN_VALIDAR_URL).toBe(vectors.systemFormatUrl);
    expect(vectors.algorithmCrossCheckUrl).toBe(
      'https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-cnh/',
    );
    expect(vectors.implementationCrossCheckUrls).toEqual([
      'https://www.geravalida.com.br/validador-cnh',
      'https://geradorbr.com/validador-de-cnh/',
    ]);
  });
});

describe('CNH check digits', () => {
  it('computes primary DV walkthrough (base 624729276 → 37)', () => {
    expect(computeCnhFirstCheckDigit('624729276')).toEqual({ dv: 3, discount: 0 });
    expect(computeCnhSecondCheckDigit('624729276', 0)).toBe(7);
    expect(computeCnhCheckDigits('624729276')).toBe('37');
  });

  it('applies desconto when first remainder is 10', () => {
    expect(computeCnhFirstCheckDigit('000000018')).toEqual({ dv: 0, discount: 2 });
    expect(computeCnhCheckDigits('000000018')).toBe('01');
  });

  it('adjusts second DV when remainder minus desconto is negative (add 9)', () => {
    expect(computeCnhSecondCheckDigit('000000093', 2)).toBe(9);
  });

  it('subtracts desconto when remainder minus 2 is non-negative', () => {
    expect(computeCnhSecondCheckDigit('300000000', 2)).toBe(1);
  });

  it('clamps second DV to zero after desconto adds 9 to small remainder', () => {
    expect(computeCnhSecondCheckDigit('000000182', 2)).toBe(0);
  });

  it('clamps second DV to zero when remainder exceeds 9 without desconto', () => {
    expect(computeCnhSecondCheckDigit('000000006', 0)).toBe(0);
  });
});

describe('CNH validation errors', () => {
  it('rejects invalid check digit', () => {
    expect(isValidCnh(vectors.invalidCheckDigit.canonical)).toBe(false);
    const result = validateCnh(vectors.invalidCheckDigit.canonical);
    expect(result).toEqual({
      ok: false,
      code: 'INVALID_CHECK_DIGIT',
      message: 'CNH check digits are invalid',
    });
  });

  it('rejects all-same-digit sequence', () => {
    expect(isValidCnh('11111111111')).toBe(false);
    const result = validateCnh('11111111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects empty input', () => {
    const result = validateCnh('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects invalid length', () => {
    const result = validateCnh('1234567890');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects invalid character', () => {
    const result = validateCnh('624.729.276-3A');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });
});

describe('stripCnh', () => {
  it('strips non-official CPF-style decoration from input', () => {
    expect(stripCnh(CNH_GOLDEN_PRIMARY_DECORATED_INPUT)).toBe(CNH_GOLDEN_PRIMARY);
  });
});

describe('formatCnh errors', () => {
  it('rejects invalid without formatted field', () => {
    const result = formatCnh('invalid');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBeDefined();
    }
  });

  it('rejects empty input', () => {
    const result = formatCnh('');
    expect(result.ok).toBe(false);
  });
});

describe('applyCnhCanonicalFormat', () => {
  it('returns canonical digits unchanged', () => {
    expect(applyCnhCanonicalFormat(CNH_GOLDEN_PRIMARY)).toBe(CNH_GOLDEN_PRIMARY);
  });

  it('throws when canonical length is wrong', () => {
    expect(() => applyCnhCanonicalFormat('123')).toThrow('CNH must have exactly 11 digits to format');
  });
});
