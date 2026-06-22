import { describe, expect, it } from 'vitest';
import { createBrResolver, createBrRule } from '../src/create-br-adapter.js';
import { runResolver, runRuleValidate } from './test-helpers.js';

const alwaysOk = (input: string) => ({ ok: true as const, message: input });
const alwaysFail = () => ({ ok: false as const, message: 'invalid document' });

describe('createBrRule', () => {
  it('passes valid string', () => {
    expect(runRuleValidate(createBrRule(alwaysOk), '123')).toBe(true);
  });

  it('returns core message on failure', () => {
    expect(runRuleValidate(createBrRule(alwaysFail), '123')).toBe('invalid document');
  });

  it('skips validation when empty and not required', () => {
    const rule = createBrRule(alwaysFail);
    expect(runRuleValidate(rule, '')).toBe(true);
    expect(runRuleValidate(rule, '   ')).toBe(true);
  });

  it('enforces required boolean', () => {
    expect(runRuleValidate(createBrRule(alwaysOk, { required: true }), '')).toBe('Required');
  });

  it('enforces required custom message', () => {
    expect(runRuleValidate(createBrRule(alwaysOk, { required: 'CPF is required' }), '')).toBe('CPF is required');
  });

  it('rejects non-string values', () => {
    expect(runRuleValidate(createBrRule(alwaysOk), 123)).toBe('Value must be a string');
  });
});

describe('createBrResolver', () => {
  it('returns no errors for valid value', () => {
    expect(runResolver(createBrResolver('cpf', alwaysOk), { cpf: '123' })).toEqual({
      values: { cpf: '123' },
      errors: {},
    });
  });

  it('returns field error for invalid value', () => {
    expect(runResolver(createBrResolver('cpf', alwaysFail), { cpf: 'bad' })).toEqual({
      values: {},
      errors: { cpf: { type: 'custom', message: 'invalid document' } },
    });
  });

  it('allows empty optional field', () => {
    expect(runResolver(createBrResolver('cpf', alwaysFail), { cpf: '' })).toEqual({
      values: { cpf: '' },
      errors: {},
    });
  });

  it('rejects non-string field value', () => {
    expect(runResolver(createBrResolver('cpf', alwaysOk), { cpf: 1 })).toEqual({
      values: {},
      errors: { cpf: { type: 'custom', message: 'Value must be a string' } },
    });
  });
});

describe('test helpers', () => {
  it('throws when rule validate is missing', () => {
    expect(() => runRuleValidate({}, 'x')).toThrow('Expected validate function on rule');
  });

  it('throws when resolver returns a promise', () => {
    const asyncResolver = () => Promise.resolve({ values: {}, errors: {} });
    expect(() => runResolver(asyncResolver, { cpf: '1' })).toThrow('Expected sync resolver');
  });
});
