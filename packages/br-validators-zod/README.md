# @br-validators/zod

[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/open-data-brazil/br-validators/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/open-data-brazil/br-validators)](https://github.com/open-data-brazil/br-validators/releases)

Zod schemas that delegate to [`@br-validators/core`](../br-validators) **v1.10.1** `validate*` functions — same golden vectors, same error messages.

## Install

```bash
VERSION=1.10.1-data.34   # any tag from https://github.com/open-data-brazil/br-validators/releases
pnpm add "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-zod-$VERSION.tgz" "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-core-$VERSION.tgz" zod
```

**Peer dependency:** `zod` `^3.23.0 || ^4.0.0`

## Usage

```typescript
import { z } from 'zod';
import { cpfSchema, telefoneSchema } from '@br-validators/zod';

const formSchema = z.object({
  cpf: cpfSchema,
  telefone: telefoneSchema,
});

formSchema.parse({
  cpf: '123.456.789-09',
  telefone: '(11) 99999-9999',
});
```

## Exports

| Schema | Output |
|--------|--------|
| `cpfSchema` | canonical `string` |
| `cnpjSchema` | canonical `string` |
| `cepSchema` | canonical `string` |
| `telefoneSchema` | `{ value, tipo }` |
| `placaSchema` | `{ value, format }` |
| `pisPasepSchema` / `pisSchema` | canonical `string` |
| `pixKeySchema` | `{ value, keyType }` |
| `boletoSchema` | `{ value, inputKind, situacao }` |
| `cartaoCreditoSchema` | `{ value, brand }` |
| `createInscricaoEstadualSchema({ uf })` | `{ value, uf }` |

Subpath imports mirror core: `@br-validators/zod/cpf`, etc.

## License

MIT
