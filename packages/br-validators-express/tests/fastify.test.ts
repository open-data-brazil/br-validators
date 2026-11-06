import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { brValidateFastify } from '../src/fastify.js';
import { GOLDEN } from './test-helpers.js';

describe('brValidateFastify', () => {
  it('returns 400 for invalid body field', async () => {
    const app = Fastify();
    app.post(
      '/cliente',
      { preHandler: brValidateFastify({ body: { cpf: 'cpf' } }) },
      () => ({ ok: true }),
    );

    const response = await app.inject({
      method: 'POST',
      url: '/cliente',
      payload: { cpf: '00000000000' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      ok: false,
      field: 'cpf',
    });
  });

  it('allows valid requests through', async () => {
    const app = Fastify();
    app.post(
      '/cliente',
      {
        preHandler: brValidateFastify({
          body: { cpf: 'cpf', ie: 'inscricao-estadual' },
          uf: { from: 'body', field: 'uf' },
        }),
      },
      () => ({ ok: true }),
    );

    const response = await app.inject({
      method: 'POST',
      url: '/cliente',
      payload: { cpf: GOLDEN.cpf, ie: GOLDEN.ie, uf: 'SP' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });
});
