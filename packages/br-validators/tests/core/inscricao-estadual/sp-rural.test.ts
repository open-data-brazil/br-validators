import { describe, expect, it } from 'vitest';
import {
  IE_SP_RURAL_GOLDEN,
  IE_SP_RURAL_GOLDEN_MASKED,
  IE_SP_RURAL_LENGTH,
  IE_SP_RURAL_OFFICIAL_SOURCE_URL,
  formatIeProdutorRural,
  getIeProdutorRuralOfficialSourceUrl,
  isSpRuralIeInput,
  isValidIeProdutorRural,
  stripIeSpRural,
  validateIeProdutorRural,
  validateIeSpRural,
} from '../../../src/inscricao-estadual-produtor-rural.js';
import vectors from '../../vectors/inscricao-estadual-produtor-rural.official.json';

describe('golden vectors — SP produtor rural', () => {
  it('matches SINTEGRA cad_SP.html official vector', () => {
    expect(validateIeSpRural(vectors.golden.masked).ok).toBe(true);
    expect(validateIeSpRural(vectors.golden.canonical).ok).toBe(true);
    expect(IE_SP_RURAL_GOLDEN).toBe(vectors.golden.canonical);
    expect(IE_SP_RURAL_GOLDEN_MASKED).toBe(vectors.golden.masked);
    expect(IE_SP_RURAL_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });

  it('returns branded canonical value on success', () => {
    const result = validateIeSpRural(vectors.golden.masked);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(IE_SP_RURAL_GOLDEN);
      expect(result.uf).toBe('SP');
      expect(result.format).toBe('inscricao-estadual-produtor-rural');
    }
  });
});

describe('validateIeProdutorRural', () => {
  it('accepts SP golden via entrypoint', () => {
    expect(validateIeProdutorRural('SP', vectors.golden.masked).ok).toBe(true);
    expect(isValidIeProdutorRural('SP', vectors.golden.canonical)).toBe(true);
  });

  it('rejects non-SP UF', () => {
    const result = validateIeProdutorRural('MT', vectors.mtAgroRegression.legacy11);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
      expect(result.uf).toBe('MT');
    }
  });
});

describe('rejections', () => {
  it('rejects invalid prefix', () => {
    const result = validateIeSpRural(vectors.invalidPrefix.input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects wrong length', () => {
    expect(validateIeSpRural(vectors.invalidLengthShort.input).ok).toBe(false);
    const long = validateIeSpRural(vectors.invalidLengthLong.input);
    expect(long.ok).toBe(false);
    if (!long.ok) expect(long.code).toBe('INVALID_LENGTH');
  });

  it('rejects wrong check digit', () => {
    const result = validateIeSpRural(vectors.invalidCheckDigit.input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHECK_DIGIT');
  });

  it('rejects invalid characters', () => {
    const result = validateIeSpRural(vectors.invalidCharacter.input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects empty input', () => {
    const result = validateIeSpRural(vectors.emptyInput.input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMPTY_INPUT');
  });
});

describe('strip and format', () => {
  it('strips masked golden to canonical', () => {
    expect(stripIeSpRural(vectors.golden.masked)).toBe(IE_SP_RURAL_GOLDEN);
    expect(stripIeSpRural('p-01100424.3/002')).toBe(IE_SP_RURAL_GOLDEN);
  });

  it('formats canonical to masked', () => {
    const result = formatIeProdutorRural(vectors.golden.canonical);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.formatted).toBe(IE_SP_RURAL_GOLDEN_MASKED);
  });

  it('propagates validation errors on format', () => {
    expect(formatIeProdutorRural(vectors.invalidCheckDigit.input).ok).toBe(false);
  });
});

describe('helpers', () => {
  it('detects P prefix input', () => {
    expect(isSpRuralIeInput(vectors.golden.masked)).toBe(true);
    expect(isSpRuralIeInput(IE_SP_RURAL_GOLDEN)).toBe(true);
    expect(isSpRuralIeInput('110042490114')).toBe(false);
  });

  it('returns official source URL', () => {
    expect(getIeProdutorRuralOfficialSourceUrl()).toBe(vectors.url);
  });

  it('exports length constant', () => {
    expect(IE_SP_RURAL_LENGTH).toBe(13);
  });
});

describe('MT agro regression', () => {
  it('uses validateInscricaoEstadual — same algorithm as industrial', async () => {
    const { validateInscricaoEstadual } = await import('../../../src/core/inscricao-estadual/index.js');
    expect(validateInscricaoEstadual(vectors.mtAgroRegression.legacy11, { uf: 'MT' }).ok).toBe(true);
  });
});

describe('applyIeSpRuralMask errors', () => {
  it('throws when length is wrong', async () => {
    const { applyIeSpRuralMask } = await import('../../../src/core/inscricao-estadual/mask.js');
    expect(() => applyIeSpRuralMask('P01100424300')).toThrow();
    expect(() => applyIeSpRuralMask('011004243002')).toThrow();
  });
});
