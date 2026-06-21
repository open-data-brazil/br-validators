import { describe, expect, it, vi } from 'vitest';
import {
  IE_DF_GOLDEN,
  IE_SP_GOLDEN,
  applyIeDfMask,
  applyIeSpMask,
  formatInscricaoEstadual,
  normalizeMtToCanonical,
  padMtLegacy,
  validateIeDf,
  validateIeMt,
  validateInscricaoEstadual,
} from '../../../src/core/inscricao-estadual/index.js';
import {
  computeIeDfCheckDigit,
  computeIeMtCheckDigit,
  computeIeSpCheckDigit,
} from '../../../src/core/inscricao-estadual/modulo-ie.js';
import * as maskModule from '../../../src/core/inscricao-estadual/mask.js';

describe('modulo-ie helpers', () => {
  it('computes MT check digit when remainder > 1', () => {
    expect(computeIeMtCheckDigit('0000000009')).toBe(4);
  });

  it('computes MT check digit when remainder <= 1', () => {
    expect(computeIeMtCheckDigit('0000000000')).toBe(0);
  });

  it('computes SP check digit when remainder is 10', () => {
    expect(computeIeSpCheckDigit('11004249', [1, 3, 4, 5, 6, 7, 8, 10])).toBe(0);
  });

  it('computes DF second check digit with DV1 included', () => {
    const dv1 = computeIeDfCheckDigit(IE_DF_GOLDEN.slice(0, 11), [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const dv2 = computeIeDfCheckDigit(IE_DF_GOLDEN.slice(0, 11), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], true, dv1);
    expect(dv2).toBe(Number(IE_DF_GOLDEN.charAt(12)));
  });
});

describe('mask helpers', () => {
  it('throws when SP length is wrong', () => {
    expect(() => applyIeSpMask('123')).toThrow('12 digits');
  });

  it('throws when DF length is wrong', () => {
    expect(() => applyIeDfMask('123')).toThrow('13 digits');
  });
});

describe('padMtLegacy', () => {
  it('pads canonical length to legacy 11', () => {
    expect(padMtLegacy('130000019')).toBe('00130000019');
  });

  it('returns null for out-of-range lengths', () => {
    expect(padMtLegacy('12345678')).toBeNull();
    expect(padMtLegacy('123456789012')).toBeNull();
  });
});

describe('normalizeMtToCanonical', () => {
  it('uses trailing slice when trimmed length is not canonical', () => {
    expect(normalizeMtToCanonical('00000000019')).toBe('000000019');
  });
});

describe('additional rejections', () => {
  it('rejects DF invalid characters before strip', () => {
    const result = validateIeDf('073abc0001009');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects DF wrong length other than legacy 12', () => {
    const result = validateIeDf('0730000100');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('rejects MT invalid characters', () => {
    const result = validateIeMt('13abc00019');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects MT short length', () => {
    const result = validateIeMt('12');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('handles mask failure in formatInscricaoEstadual', () => {
    vi.spyOn(maskModule, 'applyIeSpMask').mockImplementation(() => {
      throw new Error('mask failed');
    });
    const result = formatInscricaoEstadual(IE_SP_GOLDEN, { uf: 'SP' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.message).toBe('mask failed');
    }
    vi.restoreAllMocks();
  });

  it('handles non-Error mask failure in formatInscricaoEstadual', () => {
    vi.spyOn(maskModule, 'applyIeDfMask').mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- branch coverage for non-Error throws
      throw 'not-an-error';
    });
    const result = formatInscricaoEstadual(IE_DF_GOLDEN, { uf: 'DF' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe('Failed to format Inscrição Estadual');
    }
    vi.restoreAllMocks();
  });

  it('reports missing UF at runtime', () => {
    const result = validateInscricaoEstadual(IE_SP_GOLDEN, { uf: undefined as unknown as 'SP' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.message).toContain('undefined');
      expect(result.uf).toBeUndefined();
    }
  });
});
