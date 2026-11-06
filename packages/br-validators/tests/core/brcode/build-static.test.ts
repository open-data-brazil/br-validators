import { describe, expect, it } from 'vitest';
import {
  BRCODE_GOLDEN_STATIC_CPF,
  BRCODE_GOLDEN_STATIC_EMAIL,
  BRCODE_GOLDEN_STATIC_EVP,
  buildStaticPixBrCode,
  validateBrCode,
} from '../../../src/core/brcode/index.js';
import vectors from '../../vectors/brcode.official.json';

describe('buildStaticPixBrCode — Bacen Manual BR Code', () => {
  it('matches golden static EVP vector', () => {
    const payload = buildStaticPixBrCode({
      pixKey: vectors.staticEvp.pixKey,
      merchantName: vectors.staticEvp.merchantName,
      merchantCity: vectors.staticEvp.merchantCity,
      txid: vectors.staticEvp.txid,
    });
    expect(payload).toBe(BRCODE_GOLDEN_STATIC_EVP);
    expect(validateBrCode(payload).ok).toBe(true);
  });

  it('matches golden static email vector', () => {
    const payload = buildStaticPixBrCode({
      pixKey: vectors.staticEmail.pixKey,
      merchantName: vectors.staticEmail.merchantName,
      merchantCity: vectors.staticEmail.merchantCity,
    });
    expect(payload).toBe(BRCODE_GOLDEN_STATIC_EMAIL);
    expect(validateBrCode(payload).ok).toBe(true);
  });

  it('matches golden static CPF vector', () => {
    const payload = buildStaticPixBrCode({
      pixKey: vectors.staticCpf.pixKey,
      merchantName: vectors.staticCpf.merchantName,
      merchantCity: vectors.staticCpf.merchantCity,
    });
    expect(payload).toBe(BRCODE_GOLDEN_STATIC_CPF);
    expect(validateBrCode(payload).ok).toBe(true);
  });

  it('omits amount for permanent static QR', () => {
    const payload = buildStaticPixBrCode({
      pixKey: 'pix@bcb.gov.br',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
    });
    expect(payload).not.toContain('54');
    expect(validateBrCode(payload).ok).toBe(true);
  });

  it('includes optional fixed amount in payload', () => {
    const payload = buildStaticPixBrCode({
      pixKey: 'pix@bcb.gov.br',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
      amount: '12,34',
    });
    expect(payload).toContain('540512.34');
    expect(validateBrCode(payload).ok).toBe(true);
  });

  it('ignores invalid amount and builds permanent static QR', () => {
    const withoutAmount = buildStaticPixBrCode({
      pixKey: 'pix@bcb.gov.br',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
    });
    const withBadAmount = buildStaticPixBrCode({
      pixKey: 'pix@bcb.gov.br',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
      amount: 'not-a-number',
    });
    const withBlankAmount = buildStaticPixBrCode({
      pixKey: 'pix@bcb.gov.br',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
      amount: '   ',
    });
    expect(withBadAmount).toBe(withoutAmount);
    expect(withBlankAmount).toBe(withoutAmount);
  });

  it('trims merchant fields and uppercases city', () => {
    const payload = buildStaticPixBrCode({
      pixKey: `  ${vectors.staticEvp.pixKey}  `,
      merchantName: `  ${vectors.staticEvp.merchantName}  `,
      merchantCity: 'brasilia',
    });
    expect(payload).toBe(BRCODE_GOLDEN_STATIC_EVP);
  });

  it('defaults txid to *** when omitted', () => {
    const payload = buildStaticPixBrCode({
      pixKey: vectors.staticEvp.pixKey,
      merchantName: vectors.staticEvp.merchantName,
      merchantCity: vectors.staticEvp.merchantCity,
    });
    expect(payload).toContain('0503***');
  });
});
