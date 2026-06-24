# Install

```bash
pnpm add @br-validators/core
# or
npm install @br-validators/core
```

## Subpath imports (tree-shaking)

```typescript
import { validateCpf, formatCpf } from '@br-validators/core/cpf';
import { validateCnpj } from '@br-validators/core/cnpj';
import { getNcmPorCodigo } from '@br-validators/core/ncm';
```

## CLI

```bash
npm install -g @br-validators/cli
br-validators cpf validate 12345678909
```

## Adapters

| Adapter | Install |
|---------|---------|
| Zod | `pnpm add @br-validators/zod` |
| React Hook Form | `pnpm add @br-validators/react-hook-form` |
| Express | `pnpm add @br-validators/express` |
| Vue 3 | `pnpm add @br-validators/vue` |

See [Framework adapters](/guide/adapters).
