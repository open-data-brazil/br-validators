import { describe, expect, it } from 'vitest';
import { tokenize } from '../lib/cli/tokenize';

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(tokenize('cpf validate 123')).toEqual(['cpf', 'validate', '123']);
  });

  it('supports double-quoted values', () => {
    expect(tokenize('sanitize cpf "123.456.789-09"')).toEqual(['sanitize', 'cpf', '123.456.789-09']);
  });
});
