import { describe, expect, it } from 'vitest';
import {
  computeRenavamCheckDigit,
  computeRenavamWeightedSum,
} from '../../../src/core/renavam/check-digits.js';
import {
  RENAVAM_GOLDEN_DASH_INPUT,
  RENAVAM_GOLDEN_DV_ZERO,
  RENAVAM_GOLDEN_LEADING_ZEROS,
  RENAVAM_GOLDEN_PRIMARY,
  RENAVAM_GOLDEN_SECONDARY,
  RENAVAM_OFFICIAL_SOURCE_URL,
  RENAVAM_SENATRAN_CONSULTA_URL,
} from '../../../src/core/renavam/constants.js';
import { applyRenavamCanonicalFormat } from '../../../src/core/renavam/mask.js';
import { isValidRenavam, validateRenavam } from '../../../src/core/renavam/index.js';
import { stripRenavam } from '../../../src/strip/renavam.js';
import { formatRenavam } from '../../../src/format/renavam.js';
import vectors from '../../vectors/renavam.official.json';

describe('RENAVAM golden vectors — Portaria DENATRAN 27/2013', () => {
  it('validates official primary vector', () => {
    expect(isValidRenavam(RENAVAM_GOLDEN_PRIMARY)).toBe(true);
    expect(isValidRenavam(vectors.primary.officialFormatted)).toBe(true);
    const result = validateRenavam(RENAVAM_GOLDEN_PRIMARY);
    expect(result).toEqual({
      ok: true,
      value: RENAVAM_GOLDEN_PRIMARY,
      format: 'numeric',
    });
  });

  it('validates secondary, leading-zero, and DV-zero vectors', () => {
    expect(isValidRenavam(RENAVAM_GOLDEN_SECONDARY)).toBe(true);
    expect(isValidRenavam(vectors.secondary.officialFormatted)).toBe(true);
    expect(isValidRenavam(RENAVAM_GOLDEN_LEADING_ZEROS)).toBe(true);
    expect(isValidRenavam(vectors.leadingZeros.officialFormatted)).toBe(true);
    expect(isValidRenavam(RENAVAM_GOLDEN_DV_ZERO)).toBe(true);
    expect(isValidRenavam(vectors.dvZero.officialFormatted)).toBe(true);
  });

  it('accepts optional dash before check digit on input', () => {
    expect(isValidRenavam(vectors.secondary.dashInput)).toBe(true);
    expect(isValidRenavam(RENAVAM_GOLDEN_DASH_INPUT)).toBe(true);
  });

  it('formats as official 11 contiguous digits', () => {
    expect(formatRenavam(RENAVAM_GOLDEN_PRIMARY)).toEqual({
      ok: true,
      formatted: vectors.primary.officialFormatted,
    });
    expect(formatRenavam(RENAVAM_GOLDEN_DASH_INPUT)).toEqual({
      ok: true,
      formatted: RENAVAM_GOLDEN_SECONDARY,
    });
  });

  it('exports official source URLs', () => {
    expect(RENAVAM_OFFICIAL_SOURCE_URL).toBe(vectors.url);
    expect(RENAVAM_SENATRAN_CONSULTA_URL).toBe(vectors.systemFormatUrl);
    expect(vectors.algorithmCrossCheckUrl).toBe(
      'https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-renavam/',
    );
    expect(vectors.implementationCrossCheckUrls).toEqual([
      'https://www.geravalida.com.br/gerador-de-renavam',
      'https://geradorfacil.com/geradores/renavam',
    ]);
  });
});

describe('RENAVAM check digit', () => {
  it('computes primary DV walkthrough (base 6397779110 → 4)', () => {
    expect(computeRenavamWeightedSum('6397779110')).toBe(304);
    expect(computeRenavamCheckDigit('6397779110')).toBe(4);
  });

  it('computes secondary DV walkthrough (base 7217642641 → 5)', () => {
    expect(computeRenavamWeightedSum('7217642641')).toBe(204);
    expect(computeRenavamCheckDigit('7217642641')).toBe(5);
  });

  it('returns zero when DV equals 11 after subtraction', () => {
    expect(computeRenavamCheckDigit('1234567890')).toBe(0);
  });
});

describe('RENAVAM validation errors', () => {
  it('rejects invalid check digit', () => {
    expect(isValidRenavam(vectors.invalidCheckDigit.canonical)).toBe(false);
    const result = validateRenavam(vectors.invalidCheckDigit.canonical);
    expect(result).toEqual({
      ok: false,
      code: 'INVALID_CHECK_DIGIT',
      message: 'RENAVAM check digit is invalid',
    });
  });

  it('rejects all-same-digit sequence', () => {
    expect(isValidRenavam('11111111111')).toBe(false);
    const result = validateRenavam('11111111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects empty input', () => {
    const result = validateRenavam('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects invalid length', () => {
    const result = validateRenavam('1234567890');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects invalid character', () => {
    const result = validateRenavam('6397779110A');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });
});

describe('stripRenavam', () => {
  it('strips optional dash decoration from input', () => {
    expect(stripRenavam(RENAVAM_GOLDEN_DASH_INPUT)).toBe(RENAVAM_GOLDEN_SECONDARY);
  });
});

describe('formatRenavam errors', () => {
  it('rejects invalid without formatted field', () => {
    const result = formatRenavam('invalid');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBeDefined();
    }
  });

  it('rejects empty input', () => {
    const result = formatRenavam('');
    expect(result.ok).toBe(false);
  });
});

describe('applyRenavamCanonicalFormat', () => {
  it('returns canonical digits unchanged', () => {
    expect(applyRenavamCanonicalFormat(RENAVAM_GOLDEN_PRIMARY)).toBe(RENAVAM_GOLDEN_PRIMARY);
  });

  it('throws when canonical length is wrong', () => {
    expect(() => applyRenavamCanonicalFormat('123')).toThrow('RENAVAM must have exactly 11 digits to format');
  });
});
