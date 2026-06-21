import { describe, expect, it } from 'vitest';
import {
  CARTAO_GOLDEN_AMEX,
  CARTAO_GOLDEN_LUHN_WALKTHROUGH,
  CARTAO_GOLDEN_MASTERCARD,
  CARTAO_GOLDEN_MIN_LENGTH,
  CARTAO_GOLDEN_VISA,
  CARTAO_GOLDEN_VISA_MASKED,
  CARTAO_OFFICIAL_SOURCE_URL,
  CARTAO_PAN_MAX_LENGTH,
  applyCartaoCreditoMask,
  computeLuhnSum,
  detectCardBrand,
  isValidCartaoCredito,
  isValidLuhn,
  passesLuhn,
  validateCartaoCredito,
} from '../../../src/core/cartao-credito/index.js';
import { formatCartaoCredito } from '../../../src/format/cartao-credito.js';
import { stripCartaoCredito } from '../../../src/strip/cartao-credito.js';
import vectors from '../../vectors/cartao-credito.official.json';

const ELO_GOLDEN = '5066991111111118';
const HIPERCARD_GOLDEN = '6062821111111119';
const PAN_MAX_LENGTH = '1234567890123456785';

describe('Luhn algorithm — ISO/IEC 7812-1 Annex B', () => {
  it('passes official walkthrough 79927398713', () => {
    expect(passesLuhn(CARTAO_GOLDEN_LUHN_WALKTHROUGH)).toBe(true);
    expect(passesLuhn(vectors.luhnWalkthrough.valid)).toBe(true);
    expect(computeLuhnSum(CARTAO_GOLDEN_LUHN_WALKTHROUGH) % 10).toBe(0);
  });

  it('fails walkthrough with wrong check digit 79927398710', () => {
    expect(passesLuhn(vectors.luhnWalkthrough.invalid)).toBe(false);
  });

  it('doubles alternating from rightmost digit', () => {
    const pan = '12345674';
    expect(computeLuhnSum(pan)).toBe(30);
    expect(passesLuhn(pan)).toBe(true);
  });
});

describe('Credit card golden vectors — UC-008', () => {
  it('validates Visa golden PAN', () => {
    expect(isValidCartaoCredito(CARTAO_GOLDEN_VISA)).toBe(true);
    expect(isValidCartaoCredito(vectors.visa.canonical)).toBe(true);
    const result = validateCartaoCredito(CARTAO_GOLDEN_VISA);
    expect(result).toEqual({
      ok: true,
      value: CARTAO_GOLDEN_VISA,
      format: 'cartao-credito',
      brand: 'visa',
    });
  });

  it('validates masked Visa golden', () => {
    expect(isValidCartaoCredito(CARTAO_GOLDEN_VISA_MASKED)).toBe(true);
    expect(isValidCartaoCredito(vectors.visa.masked)).toBe(true);
    expect(isValidLuhn(CARTAO_GOLDEN_VISA_MASKED)).toBe(true);
  });

  it('validates Mastercard golden PAN', () => {
    expect(isValidCartaoCredito(CARTAO_GOLDEN_MASTERCARD)).toBe(true);
    const result = validateCartaoCredito(CARTAO_GOLDEN_MASTERCARD);
    if (result.ok) {
      expect(result.brand).toBe('mastercard');
    }
  });

  it('validates Amex golden PAN', () => {
    expect(isValidCartaoCredito(CARTAO_GOLDEN_AMEX)).toBe(true);
    const result = validateCartaoCredito(CARTAO_GOLDEN_AMEX);
    if (result.ok) {
      expect(result.brand).toBe('amex');
    }
  });

  it('validates Luhn walkthrough with unknown brand', () => {
    const result = validateCartaoCredito(CARTAO_GOLDEN_LUHN_WALKTHROUGH);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.brand).toBe('unknown');
    }
  });

  it('validates minimum length 8-digit PAN', () => {
    expect(isValidCartaoCredito(CARTAO_GOLDEN_MIN_LENGTH)).toBe(true);
    expect(isValidCartaoCredito(vectors.minLength.canonical)).toBe(true);
  });

  it('exports official source URL', () => {
    expect(CARTAO_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });
});

describe('Brand detection — best-effort (BR-LUHN-005)', () => {
  it('detects Visa IIN', () => {
    expect(detectCardBrand(CARTAO_GOLDEN_VISA)).toBe('visa');
  });

  it('detects Mastercard IIN', () => {
    expect(detectCardBrand(CARTAO_GOLDEN_MASTERCARD)).toBe('mastercard');
    expect(detectCardBrand('2221000000000000')).toBe('mastercard');
  });

  it('detects Amex IIN', () => {
    expect(detectCardBrand(CARTAO_GOLDEN_AMEX)).toBe('amex');
  });

  it('detects Elo IIN prefix', () => {
    expect(detectCardBrand(ELO_GOLDEN)).toBe('elo');
  });

  it('detects Hipercard IIN prefix', () => {
    expect(detectCardBrand(HIPERCARD_GOLDEN)).toBe('hipercard');
  });

  it('returns unknown for non-matching BIN', () => {
    expect(detectCardBrand(CARTAO_GOLDEN_LUHN_WALKTHROUGH)).toBe('unknown');
    expect(detectCardBrand('6011000000000000')).toBe('unknown');
  });
});

describe('Strip and format — BR-LUHN-006/007', () => {
  it('strips masked Visa to canonical digits', () => {
    expect(stripCartaoCredito(CARTAO_GOLDEN_VISA_MASKED)).toBe(CARTAO_GOLDEN_VISA);
  });

  it('formats 16-digit PAN as 4-4-4-4 groups', () => {
    const result = formatCartaoCredito(CARTAO_GOLDEN_VISA);
    expect(result).toEqual({ ok: true, formatted: CARTAO_GOLDEN_VISA_MASKED });
  });

  it('formats Amex 15-digit PAN as 4-6-5 groups', () => {
    const result = formatCartaoCredito(CARTAO_GOLDEN_AMEX);
    expect(result).toEqual({ ok: true, formatted: '3782 822463 10005' });
  });

  it('formats 8-digit PAN in 4-digit groups', () => {
    const result = formatCartaoCredito(CARTAO_GOLDEN_MIN_LENGTH);
    expect(result).toEqual({ ok: true, formatted: '1234 5674' });
  });

  it('rejects format on invalid length', () => {
    const result = formatCartaoCredito('1234567');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('applyCartaoCreditoMask throws on out-of-range length', () => {
    expect(() => {
      applyCartaoCreditoMask('123');
    }).toThrow(/between/);
  });
});

describe('Credit card validation rejections', () => {
  it('rejects wrong check digit', () => {
    expect(isValidLuhn('4111111111111112')).toBe(false);
    const result = validateCartaoCredito('79927398710');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });

  it('rejects length below minimum', () => {
    const result = validateCartaoCredito('1234567');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
    expect(isValidLuhn('1234567')).toBe(false);
  });

  it('rejects length above maximum', () => {
    const tooLong = '1'.repeat(CARTAO_PAN_MAX_LENGTH + 1);
    const result = validateCartaoCredito(tooLong);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('accepts maximum length 19-digit PAN when Luhn passes', () => {
    expect(PAN_MAX_LENGTH.length).toBe(CARTAO_PAN_MAX_LENGTH);
    expect(isValidCartaoCredito(PAN_MAX_LENGTH)).toBe(true);
  });

  it('rejects letters in input', () => {
    const result = validateCartaoCredito('4111abcd11111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
    expect(isValidLuhn('4111abcd11111111')).toBe(false);
  });

  it('rejects all-same-digit pattern', () => {
    const result = validateCartaoCredito('1111111111111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects empty input', () => {
    const result = validateCartaoCredito('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });
});
