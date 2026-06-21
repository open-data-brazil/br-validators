import { describe, expect, it } from 'vitest';
import { brandCnpj, brandCep, brandCpf, brandPisPasep, brandPixKey, brandPlaca } from '../../src/types/validation-result.js';

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

describe('brandCep', () => {
  it('casts string to Cep brand', () => {
    const value = brandCep('01310100');
    expect(value).toBe('01310100');
  });
});

describe('brandPlaca', () => {
  it('casts string to Placa brand', () => {
    const value = brandPlaca('ABC1D23');
    expect(value).toBe('ABC1D23');
  });
});

describe('brandPisPasep', () => {
  it('casts string to PisPasep brand', () => {
    const value = brandPisPasep('10027230888');
    expect(value).toBe('10027230888');
  });
});

describe('brandPixKey', () => {
  it('casts string to PixKey brand', () => {
    const value = brandPixKey('pix@bcb.gov.br');
    expect(value).toBe('pix@bcb.gov.br');
  });
});
