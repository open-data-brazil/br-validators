# Framework adapters

Adapters delegate to `@br-validators/core` — they do not reimplement check digits.

## Zod — `@br-validators/zod`

```typescript
import { z } from 'zod';
import { cpfSchema } from '@br-validators/zod';

const schema = z.object({ cpf: cpfSchema() });
```

## React Hook Form — `@br-validators/react-hook-form`

```typescript
import { cpfRule } from '@br-validators/react-hook-form';

register('cpf', cpfRule({ required: 'CPF is required' }));
```

## Express / Fastify — `@br-validators/express`

```typescript
import { brValidate } from '@br-validators/express';

app.post('/cliente', brValidate({ body: { cpf: 'cpf' } }), handler);
```

## Vue 3 — `@br-validators/vue`

```typescript
import { useCpf } from '@br-validators/vue';

const cpf = useCpf();
// cpf.value, cpf.isValid, cpf.error, cpf.formatted
```

Official sources for every validator type: [Official sources](/reference/official-sources).
