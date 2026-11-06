import { describe, expect, it } from 'vitest';
import {
  computeNfeChaveCheckDigit,
  computeNfeChaveWeightedSum,
  isValidNfeChaveCheckDigit,
  resolveNfeChaveCheckDigit,
} from '../../../src/core/nfe-chave/dv.js';
import {
  NFE_CHAVE_GOLDEN_PRIMARY,
  NFE_CHAVE_GOLDEN_SECONDARY,
  NFE_CHAVE_MOC_DV_SECTION_URL,
  NFE_CHAVE_MOC_ONLINE_URL,
  NFE_CHAVE_MOC_PDF_URL,
  NFE_CHAVE_NFCE_QR_ILLUSTRATIVE,
  NFE_CHAVE_NFCE_QR_ILLUSTRATIVE_URL,
  NFE_CHAVE_OFFICIAL_SOURCE_URL,
} from '../../../src/core/nfe-chave/constants.js';
import { applyNfeChaveMask } from '../../../src/core/nfe-chave/mask.js';
import { isValidNfeChave, parseNfeChave, validateNfeChave } from '../../../src/core/nfe-chave/index.js';
import { parseNfeChaveParts } from '../../../src/core/nfe-chave/parse.js';
import { formatNfeChave } from '../../../src/format/nfe-chave.js';
import { stripNfeChave } from '../../../src/strip/nfe-chave.js';
import vectors from '../../vectors/nfe-chave.official.json';

describe('NF-e chave de acesso golden vectors — MOC §2.2.6.2', () => {
  it('validates official primary vector (MOC worked example, sum=644, DV=5)', () => {
    expect(isValidNfeChave(NFE_CHAVE_GOLDEN_PRIMARY)).toBe(true);
    expect(isValidNfeChave(vectors.primary.officialFormatted)).toBe(true);
    const result = validateNfeChave(NFE_CHAVE_GOLDEN_PRIMARY);
    expect(result).toEqual({
      ok: true,
      value: NFE_CHAVE_GOLDEN_PRIMARY,
      format: 'numeric',
      parsed: vectors.primary.parsed,
      uf: 'GO',
    });
  });

  it('validates secondary MOC online vector', () => {
    expect(isValidNfeChave(NFE_CHAVE_GOLDEN_SECONDARY)).toBe(true);
    const result = validateNfeChave(NFE_CHAVE_GOLDEN_SECONDARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.parsed).toEqual(vectors.secondary.parsed);
      expect(result.uf).toBe('PR');
    }
  });

  it('rejects MOC NFC-e QR illustrative chave (DV inconsistent with §2.2.6.2)', () => {
    expect(isValidNfeChave(NFE_CHAVE_NFCE_QR_ILLUSTRATIVE)).toBe(false);
    const result = validateNfeChave(NFE_CHAVE_NFCE_QR_ILLUSTRATIVE);
    expect(result).toEqual({
      ok: false,
      code: 'INVALID_CHECK_DIGIT',
      message: 'NF-e chave de acesso check digit is invalid',
    });
  });

  it('computes MOC walkthrough weighted sum and DV', () => {
    expect(computeNfeChaveWeightedSum(vectors.primary.base43)).toBe(vectors.primary.weightedSum);
    expect(resolveNfeChaveCheckDigit(vectors.primary.weightedSum)).toBe(Number(vectors.primary.cDV));
    expect(resolveNfeChaveCheckDigit(661)).toBe(0);
    expect(resolveNfeChaveCheckDigit(660)).toBe(0);
    expect(computeNfeChaveCheckDigit(vectors.primary.base43)).toBe(Number(vectors.primary.cDV));
    expect(isValidNfeChaveCheckDigit(NFE_CHAVE_GOLDEN_PRIMARY)).toBe(true);
  });

  it('formats with grouped display mask', () => {
    expect(formatNfeChave(NFE_CHAVE_GOLDEN_PRIMARY)).toEqual({
      ok: true,
      formatted: vectors.primary.officialFormatted,
    });
    expect(applyNfeChaveMask(NFE_CHAVE_GOLDEN_PRIMARY)).toBe(vectors.primary.officialFormatted);
    expect(formatNfeChave(vectors.invalidLengthShort.canonical)).toEqual({
      ok: false,
      code: 'INVALID_LENGTH',
      message: 'NF-e chave de acesso must have 44 digits after normalization',
    });
  });

  it('exports official source URLs', () => {
    expect(NFE_CHAVE_OFFICIAL_SOURCE_URL).toBe(vectors.url);
    expect(NFE_CHAVE_MOC_ONLINE_URL).toBe(vectors.mocOnlineUrl);
    expect(NFE_CHAVE_MOC_DV_SECTION_URL).toBe(vectors.mocDvSectionUrl);
    expect(NFE_CHAVE_MOC_PDF_URL).toBe(vectors.mocPdfUrl);
    expect(NFE_CHAVE_NFCE_QR_ILLUSTRATIVE_URL).toBe(vectors.nfceQrIllustrativeUrl);
    expect(vectors.normativeNote).toContain('2.2.6.2');
  });
});

describe('NF-e chave de acesso parse', () => {
  it('parseNfeChave returns parsed fields on success', () => {
    const result = parseNfeChave(NFE_CHAVE_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.parsed.cnpj).toBe('33009911002506');
      expect(result.parsed.mod).toBe('55');
    }
  });

  it('parseNfeChaveParts extracts field slices', () => {
    expect(parseNfeChaveParts(NFE_CHAVE_GOLDEN_PRIMARY)).toEqual(vectors.primary.parsed);
    expect(parseNfeChaveParts('short')).toBeNull();
  });

  it('strip removes spaces and punctuation', () => {
    expect(stripNfeChave(vectors.primary.officialFormatted)).toBe(NFE_CHAVE_GOLDEN_PRIMARY);
  });
});

describe('NF-e chave de acesso rejection cases', () => {
  it('rejects empty input', () => {
    expect(validateNfeChave('')).toEqual({
      ok: false,
      code: 'EMPTY_INPUT',
      message: 'NF-e chave de acesso input is empty',
    });
  });

  it('rejects non-numeric characters', () => {
    const result = validateNfeChave(vectors.invalidCharacter.input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('rejects short and long lengths', () => {
    const shortResult = validateNfeChave(vectors.invalidLengthShort.canonical);
    const longResult = validateNfeChave(vectors.invalidLengthLong.canonical);
    expect(shortResult.ok).toBe(false);
    expect(longResult.ok).toBe(false);
    if (!shortResult.ok) {
      expect(shortResult.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects wrong check digit', () => {
    const result = validateNfeChave(vectors.invalidCheckDigit.canonical);
    expect(result).toEqual({
      ok: false,
      code: 'INVALID_CHECK_DIGIT',
      message: 'NF-e chave de acesso check digit is invalid',
    });
  });

  it('rejects invalid IBGE cUF', () => {
    const result = validateNfeChave(vectors.invalidCuf.canonical);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
      expect(result.message).toContain('cUF');
    }
  });

  it('rejects unsupported modelo', () => {
    const result = validateNfeChave(vectors.invalidModel.canonical);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
      expect(result.message).toContain('55');
    }
  });

  it('applyNfeChaveMask throws on wrong length', () => {
    expect(() => applyNfeChaveMask('123')).toThrow(/44 digits/);
  });

  it('computeNfeChaveCheckDigit throws on wrong base length', () => {
    expect(() => computeNfeChaveCheckDigit('123')).toThrow(/43 digits/);
  });
});
