import { describe, expect, it } from 'vitest';
import {
  validateBoleto,
  validateCnpj,
  validateCpf,
  validateInscricaoEstadual,
  validatePixKey,
} from '@br-validators/core';
import {
  generateValidDocument,
  initialWorkspaceInput,
  randomSeed,
  supportsValidGeneration,
} from '../lib/playground-generate';

describe('playground-generate', () => {
  it('supports valid generation for core document slugs', () => {
    expect(supportsValidGeneration('cpf')).toBe(true);
    expect(supportsValidGeneration('pix')).toBe(true);
    expect(supportsValidGeneration('boleto')).toBe(true);
    expect(supportsValidGeneration('nfe-chave')).toBe(false);
  });

  it('generates valid raw and formatted CPF', () => {
    const seed = randomSeed();
    const raw = generateValidDocument('cpf', { seed, masked: false });
    const formatted = generateValidDocument('cpf', { seed, masked: true });

    expect(validateCpf(raw).ok).toBe(true);
    expect(validateCpf(formatted).ok).toBe(true);
    expect(raw).toMatch(/^\d{11}$/);
    expect(formatted).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  });

  it('generates valid formatted CNPJ with punctuation', () => {
    const value = generateValidDocument('cnpj', { masked: true, format: 'numeric' });
    expect(validateCnpj(value).ok).toBe(true);
    expect(value).toContain('.');
  });

  it('generates valid PIX EVP keys', () => {
    const raw = generateValidDocument('pix', { masked: false });
    expect(validatePixKey(raw).ok).toBe(true);
  });

  it('returns formatted and raw boleto golden samples', () => {
    const formatted = generateValidDocument('boleto', { masked: true });
    const raw = generateValidDocument('boleto', { masked: false });
    expect(validateBoleto(formatted).ok).toBe(true);
    expect(validateBoleto(raw).ok).toBe(true);
    expect(raw).toMatch(/^\d+$/);
  });

  it('seeds initial workspace input with valid formatted data', () => {
    const value = initialWorkspaceInput('cpf', 'SP');
    expect(validateCpf(value).ok).toBe(true);
    expect(value).toContain('.');
  });

  it('formats IE for selected UF on generate', () => {
    const value = generateValidDocument('ie', { uf: 'SP', masked: true });
    expect(validateInscricaoEstadual(value, { uf: 'SP' }).ok).toBe(true);
  });
});
