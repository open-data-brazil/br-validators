import { describe, expect, it } from 'vitest';
import * as root from '../src/index.js';
import * as cnpjEntry from '../src/cnpj.js';
import * as cpfEntry from '../src/cpf.js';
import * as cepEntry from '../src/cep.js';
import * as telefoneEntry from '../src/telefone.js';
import * as placaEntry from '../src/placa.js';
import * as pisPasepEntry from '../src/pis-pasep.js';
import * as pixEntry from '../src/pix.js';
import * as boletoEntry from '../src/boleto.js';
import * as cartaoCreditoEntry from '../src/cartao-credito.js';

describe('package exports', () => {
  it('re-exports CNPJ API from index', () => {
    expect(root.validateCnpj).toBeTypeOf('function');
    expect(root.stripCnpj).toBeTypeOf('function');
    expect(root.formatCnpj).toBeTypeOf('function');
  });

  it('re-exports CPF API from index', () => {
    expect(root.validateCpf).toBeTypeOf('function');
    expect(root.stripCpf).toBeTypeOf('function');
    expect(root.formatCpf).toBeTypeOf('function');
  });

  it('re-exports CEP API from index', () => {
    expect(root.validateCep).toBeTypeOf('function');
    expect(root.stripCep).toBeTypeOf('function');
    expect(root.formatCep).toBeTypeOf('function');
  });

  it('re-exports Telefone API from index', () => {
    expect(root.validateTelefone).toBeTypeOf('function');
    expect(root.stripTelefone).toBeTypeOf('function');
    expect(root.formatTelefone).toBeTypeOf('function');
  });

  it('re-exports Placa API from index', () => {
    expect(root.validatePlaca).toBeTypeOf('function');
    expect(root.stripPlaca).toBeTypeOf('function');
    expect(root.formatPlaca).toBeTypeOf('function');
    expect(root.convertPlacaToMercosul).toBeTypeOf('function');
    expect(root.detectPlacaFormat).toBeTypeOf('function');
  });

  it('re-exports PIS/PASEP API from index', () => {
    expect(root.validatePisPasep).toBeTypeOf('function');
    expect(root.stripPisPasep).toBeTypeOf('function');
    expect(root.formatPisPasep).toBeTypeOf('function');
  });

  it('re-exports PIX API from index', () => {
    expect(root.validatePixKey).toBeTypeOf('function');
    expect(root.detectPixKeyType).toBeTypeOf('function');
    expect(root.isValidPixKey).toBeTypeOf('function');
  });

  it('re-exports Boleto API from index', () => {
    expect(root.validateBoleto).toBeTypeOf('function');
    expect(root.detectBoletoInputKind).toBeTypeOf('function');
    expect(root.isValidBoleto).toBeTypeOf('function');
    expect(root.convertLinhaToCodigoBarras).toBeTypeOf('function');
    expect(root.formatLinhaDigitavel).toBeTypeOf('function');
  });

  it('re-exports Credit card API from index', () => {
    expect(root.validateCartaoCredito).toBeTypeOf('function');
    expect(root.isValidLuhn).toBeTypeOf('function');
    expect(root.detectCardBrand).toBeTypeOf('function');
    expect(root.stripCartaoCredito).toBeTypeOf('function');
    expect(root.formatCartaoCredito).toBeTypeOf('function');
  });

  it('re-exports format pipeline from index', () => {
    expect(root.formatDocument).toBeTypeOf('function');
    expect(root.formatPixKey).toBeTypeOf('function');
    expect(root.formatBoleto).toBeTypeOf('function');
    expect(root.isFormattableDocumentType('cpf')).toBe(true);
  });

  it('re-exports CNPJ API from cnpj entry', () => {
    expect(cnpjEntry.validateCnpj).toBe(root.validateCnpj);
  });

  it('re-exports CPF API from cpf entry', () => {
    expect(cpfEntry.validateCpf).toBe(root.validateCpf);
  });

  it('re-exports CEP API from cep entry', () => {
    expect(cepEntry.validateCep).toBe(root.validateCep);
  });

  it('re-exports Telefone API from telefone entry', () => {
    expect(telefoneEntry.validateTelefone).toBe(root.validateTelefone);
  });

  it('re-exports Placa API from placa entry', () => {
    expect(placaEntry.validatePlaca).toBe(root.validatePlaca);
  });

  it('re-exports PIS/PASEP API from pis-pasep entry', () => {
    expect(pisPasepEntry.validatePisPasep).toBe(root.validatePisPasep);
  });

  it('re-exports PIX API from pix entry', () => {
    expect(pixEntry.validatePixKey).toBe(root.validatePixKey);
    expect(pixEntry.detectPixKeyType).toBe(root.detectPixKeyType);
    expect(pixEntry.isValidPixKey).toBe(root.isValidPixKey);
  });

  it('re-exports Boleto API from boleto entry', () => {
    expect(boletoEntry.validateBoleto).toBe(root.validateBoleto);
    expect(boletoEntry.detectBoletoInputKind).toBe(root.detectBoletoInputKind);
    expect(boletoEntry.isValidBoleto).toBe(root.isValidBoleto);
  });

  it('re-exports Credit card API from cartao-credito entry', () => {
    expect(cartaoCreditoEntry.validateCartaoCredito).toBe(root.validateCartaoCredito);
    expect(cartaoCreditoEntry.detectCardBrand).toBe(root.detectCardBrand);
    expect(cartaoCreditoEntry.isValidLuhn).toBe(root.isValidLuhn);
  });
});
