import { describe, expect, it } from 'vitest';
import { toBrValidateRequest } from '../src/fastify.js';

describe('toBrValidateRequest', () => {
  it('maps fastify-like request parts to validate request objects', () => {
    expect(
      toBrValidateRequest({
        body: { cpf: '123' },
        query: { uf: 'SP' },
        params: { id: '1' },
      }),
    ).toEqual({
      body: { cpf: '123' },
      query: { uf: 'SP' },
      params: { id: '1' },
    });
  });

  it('drops non-object parts', () => {
    expect(toBrValidateRequest({ body: 'bad', query: null, params: undefined })).toEqual({
      body: undefined,
      query: undefined,
      params: undefined,
    });
  });
});
