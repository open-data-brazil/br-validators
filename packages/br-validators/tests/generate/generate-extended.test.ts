import { describe, expect, it } from 'vitest';
import { createRandomSource } from '../../src/generate/random.js';
import { generatePixEvpValue } from '../../src/generate/pix.js';
import { generateNfeChaveValue } from '../../src/generate/nfe-chave.js';
import { generateBrcodeValue } from '../../src/generate/brcode.js';
import { generateBoletoValue } from '../../src/generate/boleto.js';
import {
  applyArrecadacaoLinhaMask,
  generateBoletoArrecadacaoValue,
} from '../../src/generate/boleto-arrecadacao.js';
import { generateIeProdutorRuralValue } from '../../src/generate/inscricao-estadual-produtor-rural.js';
import { validatePixEvpKey } from '../../src/core/pix/evp.js';
import { validateNfeChave } from '../../src/core/nfe-chave/index.js';
import { validateBrCode } from '../../src/core/brcode/index.js';
import { validateBoleto } from '../../src/core/boleto/index.js';
import { validateArrecadacao } from '../../src/core/boleto/arrecadacao.js';
import { validateIeSpRural } from '../../src/core/inscricao-estadual/sp-rural.js';
import { PIX_GOLDEN_EVP } from '../../src/core/pix/constants.js';
import { NFE_CHAVE_GOLDEN_PRIMARY } from '../../src/core/nfe-chave/constants.js';
import { BRCODE_GOLDEN_STATIC_EVP } from '../../src/core/brcode/constants.js';
import { BOLETO_GOLDEN_LINHA_STRIPPED } from '../../src/core/boleto/constants.js';
import { IE_SP_RURAL_GOLDEN } from '../../src/core/inscricao-estadual/constants.js';
import vectors from '../vectors/boleto-arrecadacao.official.json';

const alwaysInvalid = () => ({ ok: false as const });

describe('extended generate modules', () => {
  it('generatePixEvpValue produces valid EVP keys', () => {
    const rng = createRandomSource(42);
    const value = generatePixEvpValue(rng);
    expect(validatePixEvpKey(value).ok).toBe(true);
  });

  it('generatePixEvpValue fallback', () => {
    const rng = createRandomSource(1);
    expect(generatePixEvpValue(rng, alwaysInvalid)).toBe(PIX_GOLDEN_EVP);
  });

  it('generateNfeChaveValue produces valid 44-digit keys', () => {
    const value = generateNfeChaveValue(createRandomSource(7));
    expect(validateNfeChave(value).ok).toBe(true);
    expect(value).toHaveLength(44);
  });

  it('generateNfeChaveValue fallback', () => {
    expect(generateNfeChaveValue(createRandomSource(1), alwaysInvalid)).toBe(NFE_CHAVE_GOLDEN_PRIMARY);
  });

  it('generateBrcodeValue produces valid static BR Code', () => {
    const value = generateBrcodeValue(createRandomSource(9));
    expect(validateBrCode(value).ok).toBe(true);
  });

  it('generateBrcodeValue accepts amount and txid options', () => {
    const value = generateBrcodeValue(createRandomSource(10), {
      pixKey: 'pix@bcb.gov.br',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
      amount: '12.50',
      txid: 'TEST123',
    });
    expect(validateBrCode(value).ok).toBe(true);
    expect(value).toContain('12.50');
  });

  it('generateBrcodeValue fallback', () => {
    expect(generateBrcodeValue(createRandomSource(1), {}, alwaysInvalid)).toBe(BRCODE_GOLDEN_STATIC_EVP);
  });

  it('generateBoletoValue produces valid cobrança linha', () => {
    const value = generateBoletoValue(createRandomSource(11));
    expect(validateBoleto(value).ok).toBe(true);
    expect(value).toHaveLength(47);
  });

  it('generateBoletoValue fallback', () => {
    expect(generateBoletoValue(createRandomSource(1), alwaysInvalid)).toBe(BOLETO_GOLDEN_LINHA_STRIPPED);
  });

  it('generateBoletoArrecadacaoValue produces valid 48-digit linha', () => {
    const value = generateBoletoArrecadacaoValue(createRandomSource(13));
    expect(validateArrecadacao(value).ok).toBe(true);
    expect(value).toHaveLength(48);
    expect(value.startsWith('8')).toBe(true);
  });

  it('generateBoletoArrecadacaoValue fallback', () => {
    expect(generateBoletoArrecadacaoValue(createRandomSource(1), alwaysInvalid)).toBe(vectors.primary.linha);
  });

  it('applyArrecadacaoLinhaMask matches golden masked linha', () => {
    expect(applyArrecadacaoLinhaMask(vectors.primary.linha)).toBe(vectors.primary.linhaMasked);
  });

  it('generateIeProdutorRuralValue produces valid SP rural IE', () => {
    const value = generateIeProdutorRuralValue(createRandomSource(17));
    expect(validateIeSpRural(value).ok).toBe(true);
    expect(value.startsWith('P')).toBe(true);
  });

  it('generateIeProdutorRuralValue fallback', () => {
    expect(generateIeProdutorRuralValue(createRandomSource(1), alwaysInvalid)).toBe(IE_SP_RURAL_GOLDEN);
  });
});
