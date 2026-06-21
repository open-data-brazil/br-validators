import { describe, expect, it } from 'vitest';
import {
  PLACA_GOLDEN_CONVERSION_FROM,
  PLACA_GOLDEN_CONVERSION_TO,
  PLACA_GOLDEN_LEGACY,
  PLACA_GOLDEN_MERCOSUL,
  PLACA_OFFICIAL_SOURCE_URL,
} from '../../../src/core/placa/constants.js';
import {
  convertPlacaToMercosul,
  detectPlacaFormat,
  isValidPlaca,
  isValidPlacaLegacy,
  isValidPlacaMercosul,
  validatePlaca,
} from '../../../src/core/placa/index.js';
import { stripPlaca } from '../../../src/strip/placa.js';
import { formatPlaca } from '../../../src/format/placa.js';
import vectors from '../../vectors/placa.official.json';

describe('Placa golden vectors — CONTRAN', () => {
  it('validates Mercosul golden ABC1D23', () => {
    expect(isValidPlacaMercosul(PLACA_GOLDEN_MERCOSUL)).toBe(true);
    expect(isValidPlaca(PLACA_GOLDEN_MERCOSUL)).toBe(true);
    expect(isValidPlaca(vectors.mercosul.canonical)).toBe(true);
  });

  it('validates legacy golden ABC1234', () => {
    expect(isValidPlacaLegacy(PLACA_GOLDEN_LEGACY)).toBe(true);
    expect(isValidPlaca(PLACA_GOLDEN_LEGACY)).toBe(true);
    expect(isValidPlaca(vectors.legacy.canonical)).toBe(true);
  });

  it('validates hyphenated legacy input', () => {
    expect(isValidPlaca(vectors.legacy.formatted)).toBe(true);
    expect(isValidPlaca('ABC-1234')).toBe(true);
  });

  it('converts legacy ABC1234 to ABC1C34', () => {
    const result = convertPlacaToMercosul(PLACA_GOLDEN_CONVERSION_FROM);
    expect(result).toEqual({ ok: true, formatted: PLACA_GOLDEN_CONVERSION_TO });
    expect(result).toEqual({ ok: true, formatted: vectors.conversion.to });
  });

  it('formats lowercase Mercosul to uppercase canonical', () => {
    expect(formatPlaca('abc1d23')).toEqual({ ok: true, formatted: PLACA_GOLDEN_MERCOSUL });
  });

  it('exports official source URL', () => {
    expect(PLACA_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });
});

describe('detectPlacaFormat', () => {
  it('detects Mercosul format', () => {
    expect(detectPlacaFormat(PLACA_GOLDEN_MERCOSUL)).toBe('mercosul');
  });

  it('detects legacy format', () => {
    expect(detectPlacaFormat(PLACA_GOLDEN_LEGACY)).toBe('legacy');
  });

  it('returns unknown for invalid length', () => {
    expect(detectPlacaFormat('ABC123')).toBe('unknown');
  });
});

describe('Placa structural validation', () => {
  it('rejects empty input', () => {
    const result = validatePlaca('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects length 6', () => {
    const result = validatePlaca('ABC123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects length 8', () => {
    const result = validatePlaca('ABC12345');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects invalid characters', () => {
    const result = validatePlaca('ABC@234');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('rejects unknown 7-char pattern', () => {
    const result = validatePlaca('1234ABC');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('returns branded value with format on success', () => {
    const legacy = validatePlaca(PLACA_GOLDEN_LEGACY);
    expect(legacy.ok).toBe(true);
    if (legacy.ok) {
      expect(legacy.value).toBe(PLACA_GOLDEN_LEGACY);
      expect(legacy.format).toBe('legacy');
    }

    const mercosul = validatePlaca(PLACA_GOLDEN_MERCOSUL);
    expect(mercosul.ok).toBe(true);
    if (mercosul.ok) {
      expect(mercosul.value).toBe(PLACA_GOLDEN_MERCOSUL);
      expect(mercosul.format).toBe('mercosul');
    }
  });
});

describe('convertPlacaToMercosul', () => {
  it('converts secondary vector XYZ5678 to XYZ5G78', () => {
    expect(convertPlacaToMercosul('XYZ5678')).toEqual({ ok: true, formatted: 'XYZ5G78' });
  });

  it('rejects Mercosul input', () => {
    const result = convertPlacaToMercosul(PLACA_GOLDEN_MERCOSUL);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('rejects invalid input before convert', () => {
    const result = convertPlacaToMercosul('ABC123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('rejects empty input', () => {
    const result = convertPlacaToMercosul('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });
});

describe('stripPlaca', () => {
  it('removes hyphen and uppercases', () => {
    expect(stripPlaca('abc-1234')).toBe(PLACA_GOLDEN_LEGACY);
  });

  it('removes spaces', () => {
    expect(stripPlaca('abc 1d23')).toBe(PLACA_GOLDEN_MERCOSUL);
  });
});

describe('formatPlaca errors', () => {
  it('returns error for invalid input', () => {
    const result = formatPlaca('ABC123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });
});
