# BR Validators

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm @br-validators/core](https://img.shields.io/npm/v/@br-validators/core)](https://www.npmjs.com/package/@br-validators/core)
[![npm @br-validators/cli](https://img.shields.io/npm/v/@br-validators/cli)](https://www.npmjs.com/package/@br-validators/cli)
[![GitHub release](https://img.shields.io/github/v/release/AlexandreZanata/br-validators)](https://github.com/AlexandreZanata/br-validators/releases)

**100% open-source** (MIT) monorepo — TypeScript library, terminal CLI, and web playground for formatting and validating Brazilian document identifiers. Algorithms trace to official primary sources (Receita Federal, Bacen, CONTRAN, Correios, SEFAZ).

| Surface | Package / URL |
|---------|---------------|
| **Library** | [`@br-validators/core`](https://www.npmjs.com/package/@br-validators/core) on npm |
| **CLI** | [`@br-validators/cli`](https://www.npmjs.com/package/@br-validators/cli) on npm |
| **Playground** | [doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app/) — client-side only, no PII sent to server |

> **Note:** The unscoped npm name [`br-validators`](https://www.npmjs.com/package/br-validators) belongs to another project. Install **`@br-validators/core`** or **`@br-validators/cli`**.

---

## Install

### Library (Node, Bun, bundlers)

```bash
npm install @br-validators/core
# or
pnpm add @br-validators/core
```

### CLI

```bash
npm install -g @br-validators/cli
# or one-off
npx @br-validators/cli --help
```

---

## Use in your project

### Validate and format (barrel import)

```typescript
import { validateCnpj, formatCnpj, validateCpf } from '@br-validators/core';

const cnpj = validateCnpj('12ABC34501DE35'); // RFB FAQ Q14 golden vector
if (cnpj.ok) {
  console.log(cnpj.value); // canonical stripped value
}

const formatted = formatCnpj('12ABC34501DE35');
// { ok: true, formatted: '12.ABC.345/01DE-35' }

validateCpf('12345678909'); // never throws — check result.ok
```

### Tree-shake with subpath imports

```typescript
import { validateCep } from '@br-validators/core/cep';
import { validatePixKey } from '@br-validators/core/pix';
import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';

validateCep('01310100');
validatePixKey('pix@bcb.gov.br');
validateInscricaoEstadual('110042490114', { uf: 'SP' });
```

### Form handler pattern (never trust client input)

```typescript
import { validateCpf, stripCpf } from '@br-validators/core/cpf';

function parseCpfField(raw: string) {
  const result = validateCpf(raw);
  if (!result.ok) {
    return { error: result.message, code: result.code };
  }
  return { cpf: result.value, display: stripCpf(raw) };
}
```

### Next.js / React (client or server)

```tsx
'use client';

import { validateCnpj, formatCnpj } from '@br-validators/core/cnpj';
import { useState } from 'react';

export function CnpjField() {
  const [input, setInput] = useState('');
  const result = input ? validateCnpj(input) : null;
  const formatted = result?.ok ? formatCnpj(result.value) : null;

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      {formatted?.ok && <p>Valid: {formatted.formatted}</p>}
      {result && !result.ok && <p>{result.message}</p>}
    </div>
  );
}
```

### CI / shell scripts

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
br-validators ie validate "$IE" --uf SP --json
```

Requires Node ≥ 18. ESM only (`"type": "module"`). Zero runtime dependencies.

---

## Supported document types

| Type | Library import | CLI | Playground |
|------|----------------|-----|------------|
| CNPJ (numeric + alphanumeric) | `@br-validators/core/cnpj` | `br-validators cnpj …` | `/cnpj` |
| CPF | `@br-validators/core/cpf` | `br-validators cpf …` | `/cpf` |
| CEP | `@br-validators/core/cep` | `br-validators cep …` | `/cep` |
| License plate (Mercosul + legacy) | `@br-validators/core/placa` | `br-validators placa …` | `/placa` |
| PIS / PASEP / NIS | `@br-validators/core/pis-pasep` | `br-validators pis-pasep …` | `/pis` |
| PIX key | `@br-validators/core/pix` | `br-validators pix …` | `/pix` |
| Boleto (Situação 1 + 2) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| Credit card (Luhn / ISO 7812) | `@br-validators/core/cartao-credito` | `br-validators cartao …` | `/cartao-credito` |
| Inscrição Estadual (27 UFs) | `@br-validators/core/inscricao-estadual` | `br-validators ie … --uf SP` | `/ie` |

Official sources per type: [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md)

---

## Develop from source

```bash
git clone https://github.com/AlexandreZanata/br-validators.git
cd br-validators
pnpm install          # builds @br-validators/core via prepare
pnpm verify           # lint + typecheck + 100% coverage + build
pnpm --filter @br-validators/playground dev   # http://localhost:3000
```

---

## Monorepo layout

```
packages/br-validators/   # @br-validators/core — npm library
apps/cli/                 # @br-validators/cli — terminal
apps/playground/          # Web UI (Vercel)
```

Every shipped type exists in **library + CLI + playground**. See [docs/DELIVERY-SURFACES.md](docs/DELIVERY-SURFACES.md).

---

## Documentation

| Doc | Description |
|-----|-------------|
| [packages/br-validators/README.md](packages/br-validators/README.md) | Library install + API quick start |
| [apps/cli/README.md](apps/cli/README.md) | CLI commands |
| [docs/LIBRARY-API.md](docs/LIBRARY-API.md) | Public API contract |
| [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md) | RFB, Bacen, CONTRAN, SEFAZ sources |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phases and backlog |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

---

## Current release

| Package | npm | Version |
|---------|-----|---------|
| `@br-validators/core` | [npm](https://www.npmjs.com/package/@br-validators/core) | `0.10.0-alpha.0` |
| `@br-validators/cli` | [npm](https://www.npmjs.com/package/@br-validators/cli) | `0.10.0-alpha.1` |

Pre-1.0 — API may change. Pin exact version in production. Avoid `@br-validators/cli@0.10.0-alpha.0` (broken global install; fixed in `alpha.1`).

See [CHANGELOG.md](CHANGELOG.md) for release notes.

| Not in v0.10 | Reason |
|--------------|--------|
| BR Code payload parsing | Backlog — PIX **keys** shipped; BR Code QR parsing deferred |
| Boleto arrecadação (48-digit) | Detected only; validation deferred |
| Alphanumeric CPF | Blocked — RFB spec not published |
| IE SP rural `P…` | Shipped — `validateIeProdutorRural('SP', …)` |

---

## License

[MIT](LICENSE) — permanently free and open source. See [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md).
