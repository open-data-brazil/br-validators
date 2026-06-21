import { describe, expect, it } from 'vitest';
import * as root from '../src/index.js';
import * as cnpjEntry from '../src/cnpj.js';
import * as cpfEntry from '../src/cpf.js';

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

  it('re-exports CNPJ API from cnpj entry', () => {
    expect(cnpjEntry.validateCnpj).toBe(root.validateCnpj);
  });

  it('re-exports CPF API from cpf entry', () => {
    expect(cpfEntry.validateCpf).toBe(root.validateCpf);
  });
});
