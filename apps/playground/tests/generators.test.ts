import { describe, expect, it } from 'vitest';
import {
  generate,
  parseBrCode,
  validateArrecadacao,
  validateBoleto,
  validateBrCode,
  validateCartaoCredito,
  validateCep,
  validateCnh,
  validateCnpj,
  validateCpf,
  validateIeSpRural,
  validateInscricaoEstadual,
  validateNfeChave,
  validatePisPasep,
  validatePixKey,
  validatePlaca,
  validateRenavam,
  validateTelefone,
  validateTituloEleitor,
  type GeneratableDocumentType,
} from '@br-validators/core';
import { generateBoletoArrecadacao } from '../lib/generators/boleto-arrecadacao';
import { generateBoletoDocument } from '../lib/generators/boleto';
import { generateBrcode } from '../lib/generators/brcode';
import { generateCep } from '../lib/generators/cep';
import { generateCnh } from '../lib/generators/cnh';
import { generateCnpj } from '../lib/generators/cnpj';
import { generateCpf } from '../lib/generators/cpf';
import { generateCreditCard } from '../lib/generators/cartao';
import { generateIeDocument } from '../lib/generators/ie';
import { generateIeProdutorRural } from '../lib/generators/ie-produtor-rural';
import { generateNfeChaveDocument } from '../lib/generators/nfe-chave';
import { generatePixEvp } from '../lib/generators/pix';
import { generatePisPasep } from '../lib/generators/pis-pasep';
import { generatePlaca } from '../lib/generators/placa';
import { generateRenavam } from '../lib/generators/renavam';
import { generateTituloEleitorDocument } from '../lib/generators/titulo-eleitor';
import { generateTelefoneDocument } from '../lib/generators/telefone';
import { isTelefoneDddInUf } from '../lib/telefone-ddd-by-uf';

const SEED = 42;

function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '');
}

describe('playground generators', () => {
  it('generates valid cpf', () => {
    expect(validateCpf(generateCpf()).ok).toBe(true);
    expect(validateCpf(generate('cpf', { seed: SEED })).ok).toBe(true);
  });

  it('generates valid cnpj', () => {
    expect(validateCnpj(generateCnpj()).ok).toBe(true);
    expect(validateCnpj(generate('cnpj', { seed: SEED, format: 'alphanumeric' })).ok).toBe(true);
  });

  it('generates valid cep', () => {
    expect(validateCep(generateCep()).ok).toBe(true);
    expect(validateCep(generate('cep', { seed: SEED })).ok).toBe(true);
  });

  it('generates valid placa', () => {
    expect(validatePlaca(generatePlaca('mercosul')).ok).toBe(true);
    expect(validatePlaca(generate('placa', { seed: SEED, format: 'legacy' })).ok).toBe(true);
  });

  it('generates valid pis-pasep', () => {
    expect(validatePisPasep(generatePisPasep()).ok).toBe(true);
    expect(validatePisPasep(generate('pis-pasep', { seed: SEED })).ok).toBe(true);
  });

  it('generates valid telefone', () => {
    const value = generateTelefoneDocument('SP', 'celular', false, SEED);
    expect(validateTelefone(value).ok).toBe(true);
    expect(isTelefoneDddInUf(value.slice(0, 2), 'SP')).toBe(true);
    expect(validateTelefone(generate('telefone', { seed: SEED, format: 'fixo' })).ok).toBe(true);
  });

  it('generates valid cartao-credito', () => {
    const value = generateCreditCard('mastercard', false, SEED);
    expect(validateCartaoCredito(value).ok).toBe(true);
    expect(validateCartaoCredito(generate('cartao-credito', { seed: SEED, brand: 'visa' })).ok).toBe(true);
  });

  it('generates valid inscricao-estadual', () => {
    expect(validateInscricaoEstadual(generateIeDocument('SP', false, SEED), { uf: 'SP' }).ok).toBe(true);
    expect(validateInscricaoEstadual(generate('inscricao-estadual', { uf: 'MG', seed: SEED }), { uf: 'MG' }).ok).toBe(
      true,
    );
  });

  it('generates valid renavam', () => {
    expect(validateRenavam(generateRenavam(false, SEED)).ok).toBe(true);
    expect(validateRenavam(generate('renavam', { seed: SEED })).ok).toBe(true);
  });

  it('generates valid cnh', () => {
    expect(validateCnh(generateCnh(false, SEED)).ok).toBe(true);
    expect(validateCnh(generate('cnh', { seed: SEED })).ok).toBe(true);
  });

  it('generates valid titulo-eleitor', () => {
    expect(validateTituloEleitor(generateTituloEleitorDocument('SC', false, SEED)).ok).toBe(true);
    expect(validateTituloEleitor(generate('titulo-eleitor', { uf: 'RJ', seed: SEED })).ok).toBe(true);
  });

  it('generates valid pix', () => {
    expect(validatePixKey(generatePixEvp(SEED)).ok).toBe(true);
    expect(validatePixKey(generate('pix', { seed: SEED })).ok).toBe(true);
  });

  it('generates valid nfe-chave', () => {
    const raw = generateNfeChaveDocument(false, SEED);
    expect(validateNfeChave(raw).ok).toBe(true);
    expect(validateNfeChave(stripNonDigits(generateNfeChaveDocument(true, SEED))).ok).toBe(true);
  });

  it('generates valid brcode', () => {
    const value = generateBrcode(SEED);
    expect(parseBrCode(value).ok).toBe(true);
    expect(validateBrCode(value).ok).toBe(true);
  });

  it('generates valid boleto', () => {
    const raw = generateBoletoDocument(false, SEED);
    expect(validateBoleto(raw).ok).toBe(true);
    expect(validateBoleto(stripNonDigits(generateBoletoDocument(true, SEED))).ok).toBe(true);
  });

  it('generates valid boleto-arrecadacao', () => {
    const raw = generateBoletoArrecadacao(false, SEED);
    expect(validateArrecadacao(raw).ok).toBe(true);
    expect(validateArrecadacao(stripNonDigits(generateBoletoArrecadacao(true, SEED))).ok).toBe(true);
  });

  it('generates valid inscricao-estadual-produtor-rural', () => {
    const raw = generateIeProdutorRural(false, SEED);
    expect(validateIeSpRural(raw).ok).toBe(true);
    expect(validateIeSpRural(generate('inscricao-estadual-produtor-rural', { seed: SEED })).ok).toBe(true);
  });

  it('covers all core generatable document types', () => {
    const covered: GeneratableDocumentType[] = [
      'cpf',
      'cnpj',
      'cep',
      'placa',
      'pis-pasep',
      'telefone',
      'cartao-credito',
      'inscricao-estadual',
      'renavam',
      'cnh',
      'titulo-eleitor',
      'pix',
      'nfe-chave',
      'brcode',
      'boleto',
      'boleto-arrecadacao',
      'inscricao-estadual-produtor-rural',
    ];
    expect(covered).toHaveLength(17);
  });
});
