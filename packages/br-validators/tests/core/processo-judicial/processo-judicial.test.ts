import { describe, expect, it } from 'vitest';
import {
  computeProcessoJudicialCheckDigits,
  isValidProcessoJudicialCheckDigits,
} from '../../../src/core/processo-judicial/check-digits.js';
import {
  PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
  PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
  PROCESSO_JUDICIAL_GOLDEN_SECONDARY,
  PROCESSO_JUDICIAL_GOLDEN_SECONDARY_MASKED,
  PROCESSO_JUDICIAL_GOLDEN_TJSP,
  PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL,
} from '../../../src/core/processo-judicial/constants.js';
import { applyProcessoJudicialMask } from '../../../src/core/processo-judicial/mask.js';
import { mod97 } from '../../../src/core/processo-judicial/mod97.js';
import {
  isValidProcessoJudicial,
  parseProcessoJudicial,
  validateProcessoJudicial,
} from '../../../src/core/processo-judicial/index.js';
import { parseProcessoJudicialParts } from '../../../src/core/processo-judicial/parse.js';
import { stripProcessoJudicial } from '../../../src/strip/processo-judicial.js';
import { formatProcessoJudicial } from '../../../src/format/processo-judicial.js';
import vectors from '../../vectors/processo-judicial.official.json';

describe('Processo judicial golden vectors — CNJ Resolução 65/2008', () => {
  it('validates official primary vector', () => {
    expect(isValidProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY)).toBe(true);
    expect(isValidProcessoJudicial(vectors.primary.masked)).toBe(true);
    const result = validateProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY);
    expect(result).toEqual({
      ok: true,
      value: PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
      format: 'numeric',
      segments: vectors.primary.segments,
    });
  });

  it('validates secondary and TJSP vectors', () => {
    expect(isValidProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_SECONDARY)).toBe(true);
    expect(isValidProcessoJudicial(vectors.secondary.masked)).toBe(true);
    expect(isValidProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_TJSP)).toBe(true);
    expect(isValidProcessoJudicial(vectors.tertiary.masked)).toBe(true);
  });

  it('formats as official CNJ mask', () => {
    expect(formatProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY)).toEqual({
      ok: true,
      formatted: PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
    });
    expect(formatProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_SECONDARY_MASKED)).toEqual({
      ok: true,
      formatted: PROCESSO_JUDICIAL_GOLDEN_SECONDARY_MASKED,
    });
  });

  it('exports official source URL', () => {
    expect(PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL).toBe(vectors.url);
    expect(vectors.anexoViiiUrl).toContain('minuta_anexos_da_resoluo_numerao_nica');
  });
});

describe('Processo judicial check digits — Anexo VIII', () => {
  it('computes primary DV walkthrough (0000100 / 2008 / 9 / 21 / 0000 → 34)', () => {
    expect(
      computeProcessoJudicialCheckDigits('0000100', '2008', '9', '21', '0000'),
    ).toBe('34');
    expect(
      isValidProcessoJudicialCheckDigits('0000100', '34', '2008', '9', '21', '0000'),
    ).toBe(true);
  });

  it('rejects illustrative PDF DV 15 on primary fields', () => {
    expect(
      isValidProcessoJudicialCheckDigits('0000100', '15', '2008', '9', '21', '0000'),
    ).toBe(false);
  });

  it('mod97 handles long digit strings without precision loss', () => {
    expect(mod97('00001003420089210000')).toBe(92);
    expect(
      isValidProcessoJudicialCheckDigits('0000835', '43', '2015', '4', '05', '8000'),
    ).toBe(true);
  });
});

describe('parseProcessoJudicial', () => {
  it('returns segments on valid input', () => {
    expect(parseProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED)).toEqual(
      vectors.primary.segments,
    );
  });

  it('returns undefined on invalid input without throwing', () => {
    expect(parseProcessoJudicial(vectors.invalidCheckDigit.masked)).toBeUndefined();
    expect(parseProcessoJudicial(vectors.invalidLength.input)).toBeUndefined();
    expect(parseProcessoJudicial(vectors.invalidSegment.masked)).toBeUndefined();
    expect(parseProcessoJudicial('')).toBeUndefined();
  });

  it('parseProcessoJudicialParts extracts field slices', () => {
    expect(parseProcessoJudicialParts(PROCESSO_JUDICIAL_GOLDEN_PRIMARY)).toEqual(
      vectors.primary.segments,
    );
    expect(parseProcessoJudicialParts('short')).toBeNull();
  });
});

describe('Processo judicial structural errors', () => {
  it('rejects empty input', () => {
    expect(validateProcessoJudicial('')).toEqual({
      ok: false,
      code: 'EMPTY_INPUT',
      message: 'Processo judicial input is empty',
    });
  });

  it('rejects invalid length', () => {
    expect(validateProcessoJudicial(vectors.invalidLength.input)).toEqual({
      ok: false,
      code: 'INVALID_LENGTH',
      message: 'Processo judicial must have 20 digits after normalization',
    });
  });

  it('rejects invalid check digit', () => {
    const result = validateProcessoJudicial(vectors.invalidCheckDigit.masked);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });

  it('rejects invalid justice segment before checksum', () => {
    const result = validateProcessoJudicial(vectors.invalidSegment.masked);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects invalid characters', () => {
    expect(validateProcessoJudicial('0000100-34.2008.9.21.0000X')).toEqual({
      ok: false,
      code: 'INVALID_CHARACTER',
      message: 'Processo judicial contains invalid characters',
    });
  });

  it('strips mask punctuation', () => {
    expect(stripProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED)).toBe(
      PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
    );
  });
});

describe('applyProcessoJudicialMask', () => {
  it('throws on invalid canonical length', () => {
    expect(() => applyProcessoJudicialMask('123')).toThrow(
      'Processo judicial must have exactly 20 digits to format',
    );
  });
});
