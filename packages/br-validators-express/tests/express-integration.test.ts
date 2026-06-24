import express from 'express';
import { describe, expect, it } from 'vitest';
import { brValidate } from '../src/index.js';
import { GOLDEN } from './test-helpers.js';

async function listen(app: express.Express): Promise<{ port: number; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolve({
        port,
        close: () =>
          new Promise((done, reject) => {
            server.close((error) => {
              if (error) {
                reject(error);
                return;
              }
              done();
            });
          }),
      });
    });
  });
}

describe('brValidate express integration', () => {
  it('returns 400 with structured body for invalid cpf', async () => {
    const app = express();
    app.use(express.json());
    app.post(
      '/cliente',
      brValidate({ body: { cpf: 'cpf' } }),
      (_req, res) => {
        res.status(201).json({ ok: true });
      },
    );

    const { port, close } = await listen(app);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/cliente`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cpf: '00000000000' }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        ok: false,
        field: 'cpf',
      });
    } finally {
      await close();
    }
  });

  it('passes through to handler for valid cpf', async () => {
    const app = express();
    app.use(express.json());
    app.post(
      '/cliente',
      brValidate({ body: { cpf: 'cpf' } }),
      (_req, res) => {
        res.status(201).json({ ok: true });
      },
    );

    const { port, close } = await listen(app);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/cliente`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cpf: GOLDEN.cpf }),
      });
      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({ ok: true });
    } finally {
      await close();
    }
  });
});
