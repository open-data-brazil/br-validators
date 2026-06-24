# @br-validators/express

Express and Fastify middleware for Brazilian document validation — delegates to [`@br-validators/core`](../br-validators) `validate*` functions (BR-GENERATE-001 / BR-VALIDATE parity).

## Install

```bash
pnpm add @br-validators/express @br-validators/core express
```

**Peer dependencies:** `express` `^4.21.0 || ^5.0.0`, `@br-validators/core`

## Express

```typescript
import express from 'express';
import { brValidate } from '@br-validators/express';

const app = express();
app.use(express.json());

app.post(
  '/cliente',
  brValidate({
    body: { cpf: 'cpf', cnpj: 'cnpj', cep: 'cep' },
    uf: { from: 'body', field: 'uf' },
  }),
  (req, res) => {
    res.json({ ok: true });
  },
);
```

Invalid input returns HTTP **400** with a structured body:

```json
{
  "ok": false,
  "field": "cpf",
  "code": "INVALID_CHECK_DIGIT",
  "message": "..."
}
```

## Fastify

```typescript
import Fastify from 'fastify';
import { brValidateFastify } from '@br-validators/express/fastify';

const app = Fastify();

app.post(
  '/cliente',
  {
    preHandler: brValidateFastify({
      body: { cpf: 'cpf', ie: 'inscricao-estadual' },
      uf: { from: 'body', field: 'uf' },
    }),
  },
  async () => ({ ok: true }),
);
```

## Schema

| Option | Description |
|--------|-------------|
| `body` | Map field names → core validator type id |
| `query` | Same for `req.query` |
| `params` | Same for `req.params` |
| `uf` | `{ from: 'body' \| 'query' \| 'params', field: 'uf' }` or `{ value: 'SP' }` — required for IE and RG |

### Supported type ids (18)

`cpf`, `cnpj`, `cep`, `placa`, `pis-pasep`, `pix`, `telefone`, `boleto`, `cartao-credito`, `cnh`, `renavam`, `nfe-chave`, `titulo-eleitor`, `processo-judicial`, `inscricao-estadual`, `inscricao-estadual-produtor-rural`, `brcode`, `rg`

Official algorithm sources: [docs/OFFICIAL-SOURCES.md](../../docs/OFFICIAL-SOURCES.md).

## License

MIT
