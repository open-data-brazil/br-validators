import { describe, expect, it } from 'vitest';
import { CPF_GOLDEN_PRIMARY, TELEFONE_GOLDEN_CELULAR_MASKED } from '@br-validators/core';
import { cpfSchema, telefoneSchema } from '../src/index.js';

describe('Zod schemas — golden vectors (Zod 4)', () => {
  it('cpfSchema parses golden with Zod 4', () => {
    expect(cpfSchema.parse(CPF_GOLDEN_PRIMARY)).toBe(CPF_GOLDEN_PRIMARY);
  });

  it('telefoneSchema parses masked celular with Zod 4', () => {
    expect(telefoneSchema.parse(TELEFONE_GOLDEN_CELULAR_MASKED)).toEqual({
      value: '11999999999',
      tipo: 'celular',
    });
  });

  it('rejects invalid CPF with Zod 4 safeParse', () => {
    expect(cpfSchema.safeParse('00000000000').success).toBe(false);
  });
});
