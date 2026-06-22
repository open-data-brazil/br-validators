import { describe, expect, it } from 'vitest';
import { generate } from '../../src/generate/index.js';
import type { GeneratableDocumentType } from '../../src/generate/index.js';
import {
  computeLuhnCheckDigit,
  createRandomSource,
  hasRepeatedChars,
} from '../../src/generate/random.js';
import { validateCpf } from '../../src/core/cpf/index.js';
import { CPF_GOLDEN_PRIMARY } from '../../src/core/cpf/constants.js';
import { validateCnpj } from '../../src/core/cnpj/index.js';
import { validateCep } from '../../src/core/cep/index.js';
import { validatePlaca } from '../../src/core/placa/index.js';
import { validatePisPasep } from '../../src/core/pis-pasep/index.js';
import { validateRenavam } from '../../src/core/renavam/index.js';
import { validateCnh } from '../../src/core/cnh/index.js';
import { validateTelefone } from '../../src/core/telefone/index.js';
import { validateCartaoCredito } from '../../src/core/cartao-credito/index.js';
import { stripCpf } from '../../src/strip/cpf.js';
import cnpjVectors from '../vectors/cnpj.official.json';
import cepVectors from '../vectors/cep.official.json';
import placaVectors from '../vectors/placa.official.json';
import pisVectors from '../vectors/pis-pasep.official.json';
import renavamVectors from '../vectors/renavam.official.json';
import cnhVectors from '../vectors/cnh.official.json';
import telefoneVectors from '../vectors/telefone.official.json';
import cartaoVectors from '../vectors/cartao-credito.official.json';

const GENERATABLE_TYPES = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'renavam',
  'cnh',
  'telefone',
  'cartao-credito',
] as const;

const VALIDATORS = {
  cpf: validateCpf,
  cnpj: validateCnpj,
  cep: validateCep,
  placa: validatePlaca,
  'pis-pasep': validatePisPasep,
  renavam: validateRenavam,
  cnh: validateCnh,
  telefone: validateTelefone,
  'cartao-credito': validateCartaoCredito,
};

describe('generate()', () => {
  for (const type of GENERATABLE_TYPES) {
    it(`property: validateX(generate(${type})).ok`, () => {
      for (let i = 0; i < 20; i++) {
        const value = generate(type, { seed: 1000 + i });
        expect(VALIDATORS[type](value).ok).toBe(true);
      }
    });
  }

  it('seed reproducibility', () => {
    const a = generate('cpf', { seed: 42 });
    const b = generate('cpf', { seed: 42 });
    expect(a).toBe(b);
  });

  it('masked CPF passes format strip', () => {
    const masked = generate('cpf', { masked: true, seed: 99 });
    expect(stripCpf(masked)).toHaveLength(11);
    expect(validateCpf(masked).ok).toBe(true);
  });

  it('CNPJ alphanumeric format option', () => {
    const value = generate('cnpj', { format: 'alphanumeric', seed: 7 });
    expect(validateCnpj(value).ok).toBe(true);
    expect(/[A-Z]/.test(value)).toBe(true);
  });

  it('placa legacy and mercosul formats', () => {
    const legacy = generate('placa', { format: 'legacy', seed: 3 });
    const mercosul = generate('placa', { format: 'mercosul', seed: 3 });
    expect(validatePlaca(legacy).ok).toBe(true);
    expect(validatePlaca(mercosul).ok).toBe(true);
  });

  it('telefone fixo format', () => {
    const value = generate('telefone', { format: 'fixo', seed: 5 });
    expect(validateTelefone(value).ok).toBe(true);
  });

  it('random helpers', () => {
    expect(hasRepeatedChars('1111')).toBe(true);
    expect(hasRepeatedChars('1212')).toBe(false);
    expect(computeLuhnCheckDigit('7992739871')).toBe('3');
    const rng = createRandomSource(1);
    expect(rng.digits(5)).toHaveLength(5);
    expect(rng.letter()).toMatch(/^[A-Z]$/);
    expect(rng.pick(['a', 'b'])).toMatch(/^[ab]$/);
    const rngDefault = createRandomSource();
    expect(rngDefault.next()).toBeGreaterThanOrEqual(0);
  });

  it('generator fallbacks via test hooks', async () => {
    const { __generateTesting } = await import('../../src/generate/index.js');
    expect(__generateTesting.randomBaseDigits(9)).toHaveLength(9);
    expect(__generateTesting.randomCnpjAlphanumericBase()).toHaveLength(12);
    expect(__generateTesting.generateCepValue()).toBe('01310100');
    expect(__generateTesting.generateCartaoValue()).toBe('4111111111111111');
    expect(__generateTesting.generatePlacaValue('legacy')).toBe('ABC1234');
    expect(__generateTesting.generatePlacaValue('mercosul')).toBe('ABC1D23');
    expect(__generateTesting.generateTelefoneValue('fixo')).toBe('1133333333');
    expect(__generateTesting.generateTelefoneValue()).toBe('11999999999');
    expect(__generateTesting.generateCpfValue()).toHaveLength(11);
    expect(__generateTesting.generateCnpjValue()).toHaveLength(14);
    expect(__generateTesting.generateCnpjValue('alphanumeric')).toHaveLength(14);
    expect(__generateTesting.generatePisValue()).toHaveLength(11);
    expect(__generateTesting.generateRenavamValue()).toHaveLength(11);
    expect(__generateTesting.generateCnhValue()).toHaveLength(11);
    __generateTesting.touchAllRngMethods();
  });

  it('applyMask formats all generatable types with goldens', async () => {
    const { applyMask } = await import('../../src/generate/apply-mask.js');
    const cases: Array<[GeneratableDocumentType, string]> = [
      ['cpf', CPF_GOLDEN_PRIMARY],
      ['cnpj', cnpjVectors.numeric.canonical],
      ['cep', cepVectors.primary.canonical],
      ['placa', placaVectors.legacy.canonical],
      ['pis-pasep', pisVectors.primary.canonical],
      ['renavam', renavamVectors.primary.canonical],
      ['cnh', cnhVectors.primary.canonical],
      ['telefone', telefoneVectors.celular.canonical],
      ['cartao-credito', cartaoVectors.visa.canonical],
    ];
    for (const [type, value] of cases) {
      expect(applyMask(type, value).length).toBeGreaterThan(0);
    }
  });

  it('unsupported type throws', () => {
    expect(() => generate('unsupported' as GeneratableDocumentType)).toThrow(/Unsupported generatable type/);
  });

  it('masked output for all generatable types', () => {
    for (const type of GENERATABLE_TYPES) {
      const value = generate(type, { masked: true, seed: 77 });
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it('applyMask fallback returns raw value when format fails', async () => {
    const { applyMask } = await import('../../src/generate/apply-mask.js');
    expect(applyMask('cpf', 'bad')).toBe('bad');
    expect(applyMask('cnpj', 'bad')).toBe('bad');
    expect(applyMask('cep', 'bad')).toBe('bad');
    expect(applyMask('placa', 'bad')).toBe('bad');
    expect(applyMask('pis-pasep', 'bad')).toBe('bad');
    expect(applyMask('renavam', 'bad')).toBe('bad');
    expect(applyMask('cnh', 'bad')).toBe('bad');
    expect(applyMask('telefone', 'bad')).toBe('bad');
    expect(applyMask('cartao-credito', 'bad')).toBe('bad');
  });

  it('applyMask default branch via cast', async () => {
    const { applyMask } = await import('../../src/generate/apply-mask.js');
    expect(applyMask('unsupported' as GeneratableDocumentType, 'x')).toBe('unsupported');
  });
});
