import { describe, expect, it } from 'vitest';
import { brandCnpj, brandCpf } from '../../src/types/validation-result.js';

describe('brandCnpj', () => {
  it('casts string to Cnpj brand', () => {
    const value = brandCnpj('12ABC34501DE35');
    expect(value).toBe('12ABC34501DE35');
  });
});

describe('brandCpf', () => {
  it('casts string to Cpf brand', () => {
    const value = brandCpf('12345678909');
    expect(value).toBe('12345678909');
  });
});
