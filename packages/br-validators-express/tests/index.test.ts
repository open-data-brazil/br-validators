import { describe, expect, it } from 'vitest';
import { brValidate } from '../src/index.js';
import { GOLDEN, runHandler } from './test-helpers.js';

describe('brValidate', () => {
  it('exports express middleware factory', () => {
    const middleware = brValidate({ body: { cpf: 'cpf' } });
    expect(typeof middleware).toBe('function');
    const result = runHandler(middleware as never, { body: { cpf: GOLDEN.cpf } });
    expect(result.nextCalled).toBe(true);
  });
});
