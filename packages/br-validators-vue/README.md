# @br-validators/vue

[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/open-data-brazil/br-validators/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/open-data-brazil/br-validators)](https://github.com/open-data-brazil/br-validators/releases)

[Vue 3](https://vuejs.org/) composables that delegate validation and formatting to [`@br-validators/core`](../br-validators) **v1.10.1**.

## Install

```bash
VERSION=1.10.1-data.34   # any tag from https://github.com/open-data-brazil/br-validators/releases
pnpm add "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-vue-$VERSION.tgz" "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-core-$VERSION.tgz" vue
```

**Peer dependencies:** `vue` `^3.5.0`, `@br-validators/core`

## Generic composable

```vue
<script setup lang="ts">
import { useBrValidator } from '@br-validators/vue';

const cpf = useBrValidator('cpf');
</script>

<template>
  <input v-model="cpf.value" />
  <p v-if="cpf.error">{{ cpf.error }}</p>
  <p v-else-if="cpf.isValid">Formatted: {{ cpf.formatted }}</p>
</template>
```

## Named composables (v1)

| Composable | Core delegate |
|------------|---------------|
| `useCpf()` | `validateCpf` / `formatCpf` |
| `useCnpj()` | `validateCnpj` / `formatCnpj` |
| `useCep()` | `validateCep` / `formatCep` |
| `useTelefone()` | `validateTelefone` / `formatTelefone` |
| `usePix()` | `validatePixKey` / `formatPixKey` |
| `useInscricaoEstadual({ uf })` | `validateInscricaoEstadual` / `formatInscricaoEstadual` |

Each composable exposes reactive `value`, `error`, `formatted`, `isValid`, and `validate()`.

### Inscrição Estadual with UF ref

```typescript
import { ref } from 'vue';
import { useInscricaoEstadual } from '@br-validators/vue';

const uf = ref<'SP' | 'RJ'>('SP');
const ie = useInscricaoEstadual({ uf });
```

### PIX type constraint

```typescript
import { usePix } from '@br-validators/vue';

const pix = usePix({ pixType: 'email' });
```

Invalid values surface the same `message` string returned by core `validate*`.

Official algorithm sources: [docs/OFFICIAL-SOURCES.md](../../docs/OFFICIAL-SOURCES.md).

## License

MIT
