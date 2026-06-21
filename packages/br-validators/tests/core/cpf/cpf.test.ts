import { describe, expect, it } from 'vitest';
import {
  CPF_GOLDEN_PRIMARY,
  CPF_GOLDEN_SECONDARY,
  CPF_OFFICIAL_SOURCE_URL,
} from '../../../src/core/cpf/constants.js';
import { applyCpfMask } from '../../../src/core/cpf/mask.js';
import { isValidCpf, validateCpf } from '../../../src/core/cpf/index.js';
import { stripCpf } from '../../../src/strip/cpf.js';
import { formatCpf } from '../../../src/format/cpf.js';
import vectors from '../../vectors/cpf.official.json';

describe('CPF golden vectors — UC-001', () => {
  it('validates official primary CPF 12345678909', () => {
    expect(isValidCpf(CPF_GOLDEN_PRIMARY)).toBe(true);
    expect(isValidCpf(vectors.primary.canonical)).toBe(true);
  });

  it('validates masked official input', () => {
    expect(isValidCpf(vectors.primary.formatted)).toBe(true);
    expect(isValidCpf('123.456.789-09')).toBe(true);
  });

  it('validates secondary cross-check vector', () => {
    expect(isValidCpf(CPF_GOLDEN_SECONDARY)).toBe(true);
    expect(isValidCpf(vectors.secondary.formatted)).toBe(true);
  });

  it('formats golden vector to official mask', () => {
    const result = formatCpf(CPF_GOLDEN_PRIMARY);
    expect(result).toEqual({ ok: true, formatted: '123.456.789-09' });
  });

  it('exports official source URL', () => {
    expect(CPF_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });
});

describe('CPF check digits', () => {
  it('rejects wrong check digits', () => {
    expect(isValidCpf('12345678919')).toBe(false);
    const result = validateCpf('12345678919');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });
});

describe('CPF known invalid patterns', () => {
  it('rejects all identical digits', () => {
    expect(isValidCpf('11111111111')).toBe(false);
    const result = validateCpf('11111111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects all zeros', () => {
    expect(isValidCpf('00000000000')).toBe(false);
    const result = validateCpf('00000000000');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });
});

describe('CPF structural validation', () => {
  it('rejects empty input', () => {
    const result = validateCpf('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects wrong length', () => {
    const result = validateCpf('1234567890');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects invalid characters', () => {
    const result = validateCpf('123.456.789-0A');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('returns branded value on success', () => {
    const result = validateCpf(CPF_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CPF_GOLDEN_PRIMARY);
      expect(result.format).toBe('numeric');
    }
  });
});

describe('stripCpf', () => {
  it('removes mask characters', () => {
    expect(stripCpf('123.456.789-09')).toBe(CPF_GOLDEN_PRIMARY);
  });

  it('preserves leading zeros', () => {
    expect(stripCpf('012.345.678-90')).toBe('01234567890');
  });
});

describe('formatCpf errors', () => {
  it('returns error for invalid input', () => {
    const result = formatCpf('1234567890');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });
});

describe('applyCpfMask', () => {
  it('throws when canonical length is wrong', () => {
    expect(() => applyCpfMask('123')).toThrow('CPF must have exactly 11 digits to apply mask');
  });
});
