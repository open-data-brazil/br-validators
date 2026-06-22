import { describe, expect, it } from 'vitest';
import {
  BOLETO_GOLDEN_LINHA_MASKED,
  CARTAO_GOLDEN_VISA,
  CEP_GOLDEN_PRIMARY,
  CNPJ_GOLDEN_ALPHANUMERIC,
  CPF_GOLDEN_PRIMARY,
  IE_SP_GOLDEN,
  PIS_PASEP_GOLDEN_PRIMARY,
  PIX_GOLDEN_EMAIL,
  PLACA_GOLDEN_MERCOSUL,
  TELEFONE_GOLDEN_CELULAR_MASKED,
} from '@br-validators/core';
import {
  boletoResolver,
  boletoRule,
  cartaoCreditoResolver,
  cartaoCreditoRule,
  cepResolver,
  cepRule,
  cnpjResolver,
  cnpjRule,
  cpfResolver,
  cpfRule,
  createBoletoResolver,
  createBoletoRule,
  createInscricaoEstadualResolver,
  createInscricaoEstadualRule,
  createPixKeyResolver,
  createPixKeyRule,
  inscricaoEstadualSpResolver,
  inscricaoEstadualSpRule,
  pisPasepResolver,
  pisPasepRule,
  pisResolver,
  pisRule,
  pixKeyResolver,
  pixKeyRule,
  placaResolver,
  placaRule,
  telefoneResolver,
  telefoneRule,
} from '../src/index.js';
import { runResolver, runRuleValidate } from './test-helpers.js';

describe('React Hook Form adapters — golden vectors', () => {
  it('cpfRule and cpfResolver accept golden CPF', () => {
    expect(runRuleValidate(cpfRule(), CPF_GOLDEN_PRIMARY)).toBe(true);
    expect(runResolver(cpfResolver(), { cpf: CPF_GOLDEN_PRIMARY }).errors).toEqual({});
  });

  it('cpfRule rejects invalid CPF', () => {
    expect(runRuleValidate(cpfRule(), '00000000000')).not.toBe(true);
  });

  it('cnpjRule and cnpjResolver accept golden CNPJ', () => {
    expect(runRuleValidate(cnpjRule(), CNPJ_GOLDEN_ALPHANUMERIC)).toBe(true);
    expect(runResolver(cnpjResolver(), { cnpj: CNPJ_GOLDEN_ALPHANUMERIC }).errors).toEqual({});
  });

  it('cepRule and cepResolver accept golden CEP', () => {
    expect(runRuleValidate(cepRule(), CEP_GOLDEN_PRIMARY)).toBe(true);
    expect(runResolver(cepResolver(), { cep: CEP_GOLDEN_PRIMARY }).errors).toEqual({});
  });

  it('telefoneRule and telefoneResolver accept golden celular', () => {
    expect(runRuleValidate(telefoneRule(), TELEFONE_GOLDEN_CELULAR_MASKED)).toBe(true);
    expect(runResolver(telefoneResolver(), { telefone: TELEFONE_GOLDEN_CELULAR_MASKED }).errors).toEqual({});
  });

  it('placaRule and placaResolver accept golden placa', () => {
    expect(runRuleValidate(placaRule(), PLACA_GOLDEN_MERCOSUL)).toBe(true);
    expect(runResolver(placaResolver(), { placa: PLACA_GOLDEN_MERCOSUL }).errors).toEqual({});
  });

  it('pisPasepRule, pisRule alias, and resolvers accept golden', () => {
    expect(runRuleValidate(pisPasepRule(), PIS_PASEP_GOLDEN_PRIMARY)).toBe(true);
    expect(runRuleValidate(pisRule(), PIS_PASEP_GOLDEN_PRIMARY)).toBe(true);
    expect(runResolver(pisPasepResolver(), { pisPasep: PIS_PASEP_GOLDEN_PRIMARY }).errors).toEqual({});
    expect(runResolver(pisResolver(), { pis: PIS_PASEP_GOLDEN_PRIMARY }).errors).toEqual({});
  });

  it('pixKeyRule and resolver accept email golden', () => {
    expect(runRuleValidate(pixKeyRule(), PIX_GOLDEN_EMAIL)).toBe(true);
    expect(runResolver(pixKeyResolver(), { pixKey: PIX_GOLDEN_EMAIL }).errors).toEqual({});
  });

  it('createPixKeyRule forces type', () => {
    const rule = createPixKeyRule({ type: 'email' });
    expect(runRuleValidate(rule, PIX_GOLDEN_EMAIL)).toBe(true);
    expect(runRuleValidate(rule, CPF_GOLDEN_PRIMARY)).not.toBe(true);
    expect(runResolver(createPixKeyResolver({ type: 'email' }), { pixKey: PIX_GOLDEN_EMAIL }).errors).toEqual({});
  });

  it('boletoRule and resolver accept golden linha', () => {
    expect(runRuleValidate(boletoRule(), BOLETO_GOLDEN_LINHA_MASKED)).toBe(true);
    expect(runResolver(boletoResolver(), { boleto: BOLETO_GOLDEN_LINHA_MASKED }).errors).toEqual({});
    expect(runRuleValidate(createBoletoRule({ kind: 'linha-digitavel' }), BOLETO_GOLDEN_LINHA_MASKED)).toBe(true);
    expect(
      runResolver(createBoletoResolver({ kind: 'linha-digitavel' }), { boleto: BOLETO_GOLDEN_LINHA_MASKED }).errors,
    ).toEqual({});
  });

  it('cartaoCreditoRule and resolver accept golden visa', () => {
    expect(runRuleValidate(cartaoCreditoRule(), CARTAO_GOLDEN_VISA)).toBe(true);
    expect(runResolver(cartaoCreditoResolver(), { cartaoCredito: CARTAO_GOLDEN_VISA }).errors).toEqual({});
  });

  it('inscricaoEstadual SP rule and resolver accept golden', () => {
    expect(runRuleValidate(inscricaoEstadualSpRule(), IE_SP_GOLDEN)).toBe(true);
    expect(runResolver(inscricaoEstadualSpResolver(), { inscricaoEstadual: IE_SP_GOLDEN }).errors).toEqual({});
    expect(runRuleValidate(createInscricaoEstadualRule({ uf: 'SP' }), IE_SP_GOLDEN)).toBe(true);
    expect(
      runResolver(createInscricaoEstadualResolver({ uf: 'SP' }), { inscricaoEstadual: IE_SP_GOLDEN }).errors,
    ).toEqual({});
  });
});

describe('React Hook Form subpath exports', () => {
  it('imports cpfRule from subpath', async () => {
    const { cpfRule: subpathRule } = await import('../src/cpf.js');
    expect(runRuleValidate(subpathRule(), CPF_GOLDEN_PRIMARY)).toBe(true);
  });
});
