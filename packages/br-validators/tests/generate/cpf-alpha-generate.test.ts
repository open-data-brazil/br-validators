import { describe, expect, it } from 'vitest';
import {
  assertCpfAlphanumericGenerateAllowed,
  CPF_ALPHA_GENERATE_STUB,
  generate,
  rejectCpfAlphanumericGenerate,
} from '../../src/generate/index.js';

describe('CPF alphanumeric generate stub', () => {
  it('exports pending spec stub', () => {
    expect(rejectCpfAlphanumericGenerate()).toEqual(CPF_ALPHA_GENERATE_STUB);
    expect(CPF_ALPHA_GENERATE_STUB.code).toBe('CPF_ALPHA_SPEC_PENDING');
  });

  it('throws when generate(cpf) requests alphanumeric format', () => {
    expect(() => generate('cpf', { format: 'alphanumeric', seed: 1 })).toThrow(/CPF_ALPHA_SPEC_PENDING/);
    expect(() => {
      assertCpfAlphanumericGenerateAllowed();
    }).toThrow(/CPF_ALPHA_SPEC_PENDING/);
  });
});
