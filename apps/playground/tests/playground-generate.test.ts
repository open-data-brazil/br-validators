import { describe, expect, it } from 'vitest';
import {
  validateBoleto,
  validateCartaoCredito,
  validateCnpj,
  validateCpf,
  validateInscricaoEstadual,
  validateNfeChave,
  validatePixKey,
  validateTituloEleitor,
  detectCardBrand,
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
    expect(supportsValidGeneration('titulo-eleitor')).toBe(true);
    expect(supportsValidGeneration('nfe-chave')).toBe(true);
    expect(supportsValidGeneration('cnh')).toBe(true);
    expect(supportsValidGeneration('renavam')).toBe(true);
    expect(supportsValidGeneration('brcode')).toBe(true);
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

  it('generates valid raw and formatted boleto linha digitável', () => {
    const seed = randomSeed();
    const raw = generateValidDocument('boleto', { seed, masked: false });
    const formatted = generateValidDocument('boleto', { seed, masked: true });
    expect(validateBoleto(raw).ok).toBe(true);
    expect(validateBoleto(formatted).ok).toBe(true);
    expect(raw).toMatch(/^\d{47}$/);
    expect(formatted).toContain('.');
  });

  it('generates different boleto values per seed', () => {
    const first = generateValidDocument('boleto', { masked: false, seed: 11 });
    const second = generateValidDocument('boleto', { masked: false, seed: 22 });
    expect(validateBoleto(first).ok).toBe(true);
    expect(validateBoleto(second).ok).toBe(true);
    expect(first).not.toBe(second);
  });

  it('generates valid titulo de eleitor and NF-e chave documents', () => {
    const titulo = generateValidDocument('titulo-eleitor', { masked: true, seed: 5, uf: 'SC' });
    const nfe = generateValidDocument('nfe-chave', { masked: true, seed: 6 });
    expect(validateTituloEleitor(titulo).ok).toBe(true);
    expect(validateNfeChave(nfe).ok).toBe(true);
  });

  it('generates titulo for selected UF and cartao for selected brand', () => {
    const tituloSp = generateValidDocument('titulo-eleitor', { masked: false, seed: 1, uf: 'SP' });
    const tituloRj = generateValidDocument('titulo-eleitor', { masked: false, seed: 1, uf: 'RJ' });
    expect(validateTituloEleitor(tituloSp).ok).toBe(true);
    expect(validateTituloEleitor(tituloRj).ok).toBe(true);
    expect(tituloSp).not.toBe(tituloRj);

    const visa = generateValidDocument('cartao', { masked: false, seed: 2, format: 'visa' });
    const amex = generateValidDocument('cartao', { masked: false, seed: 2, format: 'amex' });
    expect(validateCartaoCredito(visa).ok).toBe(true);
    expect(validateCartaoCredito(amex).ok).toBe(true);
    expect(detectCardBrand(visa)).toBe('visa');
    expect(detectCardBrand(amex)).toBe('amex');
  });

  it('initial pix workspace is deterministic for hydration', () => {
    const first = initialWorkspaceInput('pix', 'SP');
    const second = initialWorkspaceInput('pix', 'SP');
    expect(first).toBe(second);
    expect(validatePixKey(first).ok).toBe(true);
  });

  it('seeds initial workspace input deterministically for hydration', () => {
    const first = initialWorkspaceInput('cpf', 'SP');
    const second = initialWorkspaceInput('cpf', 'SP');
    expect(first).toBe(second);
    expect(validateCpf(first).ok).toBe(true);
    expect(first).toContain('.');
  });

  it('uses different stable seeds per document slug', () => {
    const cpf = initialWorkspaceInput('cpf', 'SP');
    const cnpj = initialWorkspaceInput('cnpj', 'SP');
    expect(cpf).not.toBe(cnpj);
  });

  it('formats IE for selected UF on generate', () => {
    const sp = generateValidDocument('ie', { uf: 'SP', masked: true });
    const mg = generateValidDocument('ie', { uf: 'MG', masked: true });
    expect(validateInscricaoEstadual(sp, { uf: 'SP' }).ok).toBe(true);
    expect(validateInscricaoEstadual(mg, { uf: 'MG' }).ok).toBe(true);
    expect(sp).not.toBe(mg);
  });

  it('formats placa with hyphen when masked', () => {
    const value = generateValidDocument('placa', { masked: true, format: 'mercosul' });
    expect(value).toMatch(/^[A-Z]{3}-[A-Z0-9]{4}$/);
  });

  it('respects placa legacy format parameter', () => {
    const legacy = generateValidDocument('placa', { masked: true, format: 'legacy', seed: 99 });
    const mercosul = generateValidDocument('placa', { masked: true, format: 'mercosul', seed: 99 });
    expect(legacy).toMatch(/^[A-Z]{3}-\d{4}$/);
    expect(mercosul).toMatch(/^[A-Z]{3}-[A-Z0-9]{4}$/);
    expect(legacy).not.toBe(mercosul);
  });

  it('returns raw and formatted IE for the selected UF', () => {
    const seed = 42;
    const raw = generateValidDocument('ie', { uf: 'SP', masked: false, seed });
    const formatted = generateValidDocument('ie', { uf: 'SP', masked: true, seed });
    expect(validateInscricaoEstadual(raw, { uf: 'SP' }).ok).toBe(true);
    expect(validateInscricaoEstadual(formatted, { uf: 'SP' }).ok).toBe(true);
    expect(formatted).not.toBe(raw);
    expect(formatted).toContain('.');
  });

  it('generates different IE values per seed for the same UF', () => {
    const first = generateValidDocument('ie', { uf: 'RJ', masked: false, seed: 1 });
    const second = generateValidDocument('ie', { uf: 'RJ', masked: false, seed: 2 });
    expect(validateInscricaoEstadual(first, { uf: 'RJ' }).ok).toBe(true);
    expect(validateInscricaoEstadual(second, { uf: 'RJ' }).ok).toBe(true);
    expect(first).not.toBe(second);
  });
});
