# @br-validators/react-hook-form

[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/open-data-brazil/br-validators/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/open-data-brazil/br-validators)](https://github.com/open-data-brazil/br-validators/releases)

[React Hook Form](https://react-hook-form.com/) rules and resolvers that delegate to [`@br-validators/core`](../br-validators) **v1.10.1**.

## Install

```bash
VERSION=1.10.1-data.34   # any tag from https://github.com/open-data-brazil/br-validators/releases
pnpm add "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-react-hook-form-$VERSION.tgz" "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-core-$VERSION.tgz" react react-hook-form
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
