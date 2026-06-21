import { describe, expect, it } from 'vitest';
import * as root from '../src/index.js';
import * as cnpjEntry from '../src/cnpj.js';
import * as cpfEntry from '../src/cpf.js';
import * as cepEntry from '../src/cep.js';
import * as placaEntry from '../src/placa.js';

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

  it('re-exports Placa API from index', () => {
    expect(root.validatePlaca).toBeTypeOf('function');
    expect(root.stripPlaca).toBeTypeOf('function');
    expect(root.formatPlaca).toBeTypeOf('function');
    expect(root.convertPlacaToMercosul).toBeTypeOf('function');
    expect(root.detectPlacaFormat).toBeTypeOf('function');
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

  it('re-exports Placa API from placa entry', () => {
    expect(placaEntry.validatePlaca).toBe(root.validatePlaca);
  });
});
