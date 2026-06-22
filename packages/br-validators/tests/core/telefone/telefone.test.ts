import { describe, expect, it } from 'vitest';
import {
  ANATEL_DDDS,
  TELEFONE_GOLDEN_CELULAR,
  TELEFONE_GOLDEN_CELULAR_MASKED,
  TELEFONE_GOLDEN_FIXO,
  TELEFONE_GOLDEN_FIXO_MASKED,
  TELEFONE_OFFICIAL_SOURCE_URL,
} from '../../../src/core/telefone/constants.js';
import { applyTelefoneMask } from '../../../src/core/telefone/mask.js';
import { isValidTelefone, validateTelefone } from '../../../src/core/telefone/index.js';
import {
  extractTelefoneDigits,
  normalizeTelefoneDigits,
  stripTelefone,
} from '../../../src/strip/telefone.js';
import { formatTelefone } from '../../../src/format/telefone.js';
import vectors from '../../vectors/telefone.official.json';

describe('Telefone golden vectors — Anatel', () => {
  it('validates official celular vector', () => {
    expect(isValidTelefone(TELEFONE_GOLDEN_CELULAR)).toBe(true);
    expect(isValidTelefone(vectors.celular.formatted)).toBe(true);
    const result = validateTelefone(TELEFONE_GOLDEN_CELULAR);
    expect(result).toEqual({
      ok: true,
      value: TELEFONE_GOLDEN_CELULAR,
      tipo: 'celular',
      format: 'telefone',
    });
  });

  it('validates official fixo vector', () => {
    expect(isValidTelefone(TELEFONE_GOLDEN_FIXO)).toBe(true);
    expect(isValidTelefone(vectors.fixo.formatted)).toBe(true);
    const result = validateTelefone(TELEFONE_GOLDEN_FIXO);
    expect(result).toEqual({
      ok: true,
      value: TELEFONE_GOLDEN_FIXO,
      tipo: 'fixo',
      format: 'telefone',
    });
  });

  it('formats celular and fixo masks', () => {
    expect(formatTelefone(TELEFONE_GOLDEN_CELULAR)).toEqual({
      ok: true,
      formatted: TELEFONE_GOLDEN_CELULAR_MASKED,
    });
    expect(formatTelefone(TELEFONE_GOLDEN_FIXO)).toEqual({
      ok: true,
      formatted: TELEFONE_GOLDEN_FIXO_MASKED,
    });
  });

  it('exports official source URL', () => {
    expect(TELEFONE_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });

  it('exports 67 Anatel DDDs', () => {
    expect(ANATEL_DDDS).toHaveLength(67);
  });
});

describe('Telefone normalization', () => {
  it('accepts +55 country code', () => {
    const result = validateTelefone(vectors.withCountryCode.input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(vectors.withCountryCode.canonical);
      expect(result.tipo).toBe('celular');
    }
  });

  it('accepts leading domestic trunk 0', () => {
    const result = validateTelefone(vectors.withTrunkPrefix.input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(vectors.withTrunkPrefix.canonical);
    }
  });

  it('stripTelefone returns national canonical', () => {
    expect(stripTelefone(vectors.withCountryCode.input)).toBe('11999999999');
    expect(stripTelefone('01133333333')).toBe('1133333333');
  });

  it('extractTelefoneDigits keeps country code digits', () => {
    expect(extractTelefoneDigits('+55 11 99999-9999')).toBe('5511999999999');
  });

  it('normalizeTelefoneDigits strips +55', () => {
    expect(normalizeTelefoneDigits('+55 11 99999-9999')).toBe('11999999999');
  });
});

describe('Telefone negative vectors', () => {
  it.each([
    ['invalidDdd01', vectors.negative.invalidDdd01],
    ['invalidDdd20', vectors.negative.invalidDdd20],
    ['invalidDdd23', vectors.negative.invalidDdd23],
    ['celularWithout9', vectors.negative.celularWithout9],
    ['fixoStartsWith1', vectors.negative.fixoStartsWith1],
    ['shortLocal', vectors.negative.shortLocal],
    ['emergency190', vectors.negative.emergency190],
    ['emergency192', vectors.negative.emergency192],
    ['emergency193', vectors.negative.emergency193],
  ] as const)('rejects %s from official vector', (_label, vector) => {
    const result = validateTelefone(vector.input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe(vector.code);
    }
  });

  it('rejects DDD 01 with explicit message', () => {
    const result = validateTelefone(vectors.negative.invalidDdd01.input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Area code 01');
    }
  });

  it('rejects celular sem 9 masked input', () => {
    const result = validateTelefone('(11) 8888-8888');
    expect(result).toEqual(validateTelefone(vectors.negative.celularWithout9.input));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
      expect(result.message).toContain('9 digits starting with 9');
    }
  });

  it('rejects fixo inválido masked input', () => {
    const result = validateTelefone('(11) 19999-9999');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
      expect(result.message).toContain('9 digits starting with 9');
    }
  });

  it('rejects landline with invalid first digit (not 2–5)', () => {
    const result = validateTelefone('(11) 1333-3333');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
      expect(result.message).toContain('Landline numbers must have 8 digits starting with 2, 3, 4, or 5');
    }
  });

  it('rejects emergency 190', () => {
    const result = validateTelefone('190');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.message).toContain('Emergency');
    }
  });
});

describe('Telefone structural validation', () => {
  it('rejects empty input', () => {
    const result = validateTelefone('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects whitespace-only input', () => {
    const result = validateTelefone('   ');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects mask-only input with no digits', () => {
    const result = validateTelefone('( ) -');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects invalid characters', () => {
    const result = validateTelefone('(11) 99999-99A9');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('accepts dot as mask separator', () => {
    expect(isValidTelefone('(11) 99999.9999')).toBe(true);
  });

  it('rejects fixo with first digit 8', () => {
    const result = validateTelefone('(11) 8888-8888');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });
});

describe('formatTelefone errors', () => {
  it('returns error for invalid input', () => {
    const result = formatTelefone('123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });
});

describe('applyTelefoneMask', () => {
  it('throws when canonical length is wrong', () => {
    expect(() => applyTelefoneMask('123', 'celular')).toThrow(
      'Telephone must have valid celular length to apply mask',
    );
    expect(() => applyTelefoneMask('123', 'fixo')).toThrow(
      'Telephone must have valid fixo length to apply mask',
    );
  });
});
