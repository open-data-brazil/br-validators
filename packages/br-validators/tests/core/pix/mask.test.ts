import { describe, expect, it } from 'vitest';
import {
  applyPixCnpjKeyMask,
  applyPixCpfKeyMask,
  applyPixEmailKeyMask,
  applyPixEvpKeyMask,
  applyPixPhoneKeyMask,
} from '../../../src/core/pix/mask.js';
import {
  PIX_GOLDEN_CNPJ_ALPHANUMERIC,
  PIX_GOLDEN_CPF,
  PIX_GOLDEN_EMAIL,
  PIX_GOLDEN_EVP,
  PIX_GOLDEN_PHONE,
} from '../../../src/core/pix/constants.js';
import { CNPJ_GOLDEN_ALPHANUMERIC_MASKED } from '../../../src/core/cnpj/constants.js';
import { CPF_GOLDEN_PRIMARY_MASKED } from '../../../src/core/cpf/constants.js';

describe('PIX key masks', () => {
  it('delegates CPF key to CPF mask', () => {
    expect(applyPixCpfKeyMask(PIX_GOLDEN_CPF)).toBe(CPF_GOLDEN_PRIMARY_MASKED);
  });

  it('delegates CNPJ key to CNPJ mask', () => {
    expect(applyPixCnpjKeyMask(PIX_GOLDEN_CNPJ_ALPHANUMERIC)).toBe(CNPJ_GOLDEN_ALPHANUMERIC_MASKED);
  });

  it('formats Brazilian mobile phone display', () => {
    expect(applyPixPhoneKeyMask(PIX_GOLDEN_PHONE)).toBe('+55 (10) 99876-5432');
    expect(applyPixPhoneKeyMask('+5511999887766')).toBe('+55 (11) 99988-7766');
  });

  it('normalizes email to lowercase trimmed', () => {
    expect(applyPixEmailKeyMask('  PIX@BCB.GOV.BR  ')).toBe(PIX_GOLDEN_EMAIL);
  });

  it('lowercases EVP UUID', () => {
    expect(applyPixEvpKeyMask(PIX_GOLDEN_EVP.toUpperCase())).toBe(PIX_GOLDEN_EVP);
  });

  it('throws on invalid phone for mask', () => {
    expect(() => {
      applyPixPhoneKeyMask('+5511999');
    }).toThrow(/Brazilian mobile/);
  });
});
