# @br-validators/react-hook-form

[React Hook Form](https://react-hook-form.com/) rules and resolvers that delegate to [`@br-validators/core`](../br-validators).

## Install

```bash
pnpm add @br-validators/react-hook-form @br-validators/core react react-hook-form
```

## Register + validate rule

```tsx
import { useForm } from 'react-hook-form';
import { cpfRule } from '@br-validators/react-hook-form';

const { register } = useForm<{ cpf: string }>();
<input {...register('cpf', cpfRule({ required: 'CPF is required' }))} />;
```

## Resolver

```tsx
import { useForm } from 'react-hook-form';
import { cpfResolver } from '@br-validators/react-hook-form';

const form = useForm<{ cpf: string }>({ resolver: cpfResolver() });
```

Invalid values surface the same `message` string returned by core `validate*`.

## License

MIT
