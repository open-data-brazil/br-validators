import { describe, expect, it } from 'vitest';
import {
  PIX_GOLDEN_CNPJ_ALPHANUMERIC,
  PIX_GOLDEN_CNPJ_NUMERIC,
  PIX_GOLDEN_CPF,
  PIX_GOLDEN_EMAIL,
  PIX_GOLDEN_EMAIL_SECONDARY,
  PIX_GOLDEN_EVP,
  PIX_GOLDEN_PHONE,
  PIX_GOLDEN_PHONE_SECONDARY,
  PIX_OFFICIAL_SOURCE_URL,
} from '../../../src/core/pix/constants.js';
import { detectPixKeyType } from '../../../src/core/pix/detect.js';
import {
  isValidPixKey,
  validatePixKey,
  validatePixCpfKey,
  validatePixCnpjKey,
  validatePixEmailKey,
  validatePixPhoneKey,
  validatePixEvpKey,
} from '../../../src/core/pix/index.js';
import type { PixKeyType } from '../../../src/types/validation-result.js';
import vectors from '../../vectors/pix.official.json';

describe('PIX golden vectors — UC-005', () => {
  it('validates CPF key', () => {
    const result = validatePixKey(PIX_GOLDEN_CPF);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.keyType).toBe('cpf');
      expect(result.format).toBe('numeric');
      expect(result.value).toBe(PIX_GOLDEN_CPF);
    }
  });

  it('validates masked CPF key', () => {
    expect(isValidPixKey(vectors.cpf.masked)).toBe(true);
  });

  it('validates CNPJ alphanumeric key', () => {
    const result = validatePixKey(PIX_GOLDEN_CNPJ_ALPHANUMERIC);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.keyType).toBe('cnpj');
      expect(result.format).toBe('alphanumeric');
    }
  });

  it('validates CNPJ numeric key', () => {
    expect(isValidPixKey(PIX_GOLDEN_CNPJ_NUMERIC)).toBe(true);
  });

  it('validates email key', () => {
    const result = validatePixKey(PIX_GOLDEN_EMAIL);
    expect(result).toEqual({
      ok: true,
      value: PIX_GOLDEN_EMAIL,
      keyType: 'email',
      format: 'email',
    });
  });

  it('validates secondary email key', () => {
    expect(isValidPixKey(PIX_GOLDEN_EMAIL_SECONDARY)).toBe(true);
  });

  it('validates phone key', () => {
    const result = validatePixKey(PIX_GOLDEN_PHONE);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.keyType).toBe('phone');
      expect(result.format).toBe('phone');
    }
  });

  it('validates secondary phone key from Manual', () => {
    expect(isValidPixKey(PIX_GOLDEN_PHONE_SECONDARY)).toBe(true);
  });

  it('validates EVP key', () => {
    const result = validatePixKey(PIX_GOLDEN_EVP);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.keyType).toBe('evp');
      expect(result.format).toBe('evp');
    }
  });

  it('exports official source URL', () => {
    expect(PIX_OFFICIAL_SOURCE_URL).toBe(vectors.manualUrl);
  });
});

describe('detectPixKeyType', () => {
  it('detects email before numeric', () => {
    expect(detectPixKeyType('pix@bcb.gov.br')).toBe('email');
  });

  it('detects phone', () => {
    expect(detectPixKeyType(PIX_GOLDEN_PHONE)).toBe('phone');
  });

  it('detects evp', () => {
    expect(detectPixKeyType(PIX_GOLDEN_EVP)).toBe('evp');
  });

  it('detects cpf from masked input', () => {
    expect(detectPixKeyType('123.456.789-09')).toBe('cpf');
  });

  it('detects cpf', () => {
    expect(detectPixKeyType(PIX_GOLDEN_CPF)).toBe('cpf');
  });

  it('detects cnpj alphanumeric', () => {
    expect(detectPixKeyType(PIX_GOLDEN_CNPJ_ALPHANUMERIC)).toBe('cnpj');
  });

  it('returns unknown for invalid input', () => {
    expect(detectPixKeyType('not-a-key')).toBe('unknown');
    expect(detectPixKeyType('')).toBe('unknown');
  });
});

describe('validatePixKey rejections', () => {
  it('rejects uppercase email', () => {
    const result = validatePixKey('PIX@BCB.GOV.BR');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('rejects phone-shaped 11 digits as invalid cpf', () => {
    const result = validatePixKey('11999887766');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
      expect(result.keyType).toBe('cpf');
    }
  });

  it('rejects non-key string', () => {
    expect(isValidPixKey('not-a-key')).toBe(false);
  });

  it('rejects empty input', () => {
    const result = validatePixKey('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects strict type mismatch', () => {
    const result = validatePixKey(PIX_GOLDEN_CPF, { type: 'email' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.keyType).toBe('email');
    }
  });

  it('allows strict type when detected is unknown', () => {
    const result = validatePixKey('bad-email', { type: 'email' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.keyType).toBe('email');
    }
  });

  it('handles unknown forced type via internal switch default', () => {
    const result = validatePixKey('x', { type: 'invalid' as PixKeyType });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Unknown PIX key type');
    }
  });
});

describe('validatePixCpfKey', () => {
  it('rejects invalid check digit', () => {
    const result = validatePixCpfKey('12345678919');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });

  it('rejects empty cpf key', () => {
    const result = validatePixCpfKey('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });
});

describe('validatePixCnpjKey', () => {
  it('rejects invalid cnpj', () => {
    const result = validatePixCnpjKey('00000000000000');
    expect(result.ok).toBe(false);
  });

  it('rejects empty cnpj key', () => {
    const result = validatePixCnpjKey('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });
});

describe('validatePixEmailKey', () => {
  it('rejects email over 77 chars', () => {
    const longLocal = 'a'.repeat(70);
    const result = validatePixEmailKey(`${longLocal}@test.com`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects email without @', () => {
    const result = validatePixEmailKey('notanemail');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('rejects empty email key', () => {
    const result = validatePixEmailKey('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });
});

describe('validatePixPhoneKey', () => {
  it('rejects missing plus sign', () => {
    const result = validatePixPhoneKey('5510998765432');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('rejects non-Brazilian E.164', () => {
    const result = validatePixPhoneKey('+14155552671');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('rejects invalid E.164 characters', () => {
    const result = validatePixPhoneKey('+55abc');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('rejects empty phone key', () => {
    const result = validatePixPhoneKey('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects +55 number that is not mobile format', () => {
    const result = validatePixPhoneKey('+551234567890');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });
});

describe('validatePixEvpKey', () => {
  it('rejects uppercase UUID', () => {
    const result = validatePixEvpKey('123E4567-E89B-12D3-A456-426655440000');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('rejects UUID without hyphens', () => {
    const result = validatePixEvpKey('123e4567e89b12d3a456426655440000');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('rejects empty evp key', () => {
    const result = validatePixEvpKey('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });
});
