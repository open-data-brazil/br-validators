# BR Validators

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![core](https://img.shields.io/npm/v/@br-validators/core?label=core)](https://www.npmjs.com/package/@br-validators/core)
[![cli](https://img.shields.io/npm/v/@br-validators/cli?label=cli)](https://www.npmjs.com/package/@br-validators/cli)
[![zod](https://img.shields.io/npm/v/@br-validators/zod?label=zod)](https://www.npmjs.com/package/@br-validators/zod)
[![rhf](https://img.shields.io/npm/v/@br-validators/react-hook-form?label=rhf)](https://www.npmjs.com/package/@br-validators/react-hook-form)
[![GitHub release](https://img.shields.io/github/v/release/AlexandreZanata/br-validators)](https://github.com/AlexandreZanata/br-validators/releases)

**100% open-source** (MIT) monorepo — TypeScript library, terminal CLI, and web playground for formatting and validating Brazilian document identifiers. Algorithms trace to official primary sources (Receita Federal, Bacen, CONTRAN, Correios, SEFAZ).

| Surface | Package / URL |
|---------|---------------|
| **Library** | [`@br-validators/core`](https://www.npmjs.com/package/@br-validators/core) on npm |
| **CLI** | [`@br-validators/cli`](https://www.npmjs.com/package/@br-validators/cli) on npm |
| **Zod** | [`@br-validators/zod`](https://www.npmjs.com/package/@br-validators/zod) on npm |
| **React Hook Form** | [`@br-validators/react-hook-form`](https://www.npmjs.com/package/@br-validators/react-hook-form) on npm |
| **Playground** | [doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app/) — client-side only, no PII sent to server |

Reference datasets (IBGE, Bacen banks, DDD lookup, national holidays, CNAE, CFOP, NCM, CBO) are embedded offline and refreshed weekly — see [docs/DATA-FRESHNESS.md](docs/DATA-FRESHNESS.md).

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
| Telefone (Anatel) | `@br-validators/core/telefone` | `br-validators telefone …` | `/telefone` |
| CNH | `@br-validators/core/cnh` | `br-validators cnh …` | `/cnh` |
| RENAVAM | `@br-validators/core/renavam` | `br-validators renavam …` | `/renavam` |
| Título de eleitor | `@br-validators/core/titulo-eleitor` | `br-validators titulo …` | `/titulo-eleitor` |
| NF-e chave de acesso | `@br-validators/core/nfe-chave` | `br-validators nfe …` | `/nfe-chave` |
| License plate (Mercosul + legacy) | `@br-validators/core/placa` | `br-validators placa …` | `/placa` |
| PIS / PASEP / NIS | `@br-validators/core/pis-pasep` | `br-validators pis-pasep …` | `/pis` |
| PIX key | `@br-validators/core/pix` | `br-validators pix …` | `/pix` |
| BR Code (PIX QR) | `@br-validators/core/brcode` | `br-validators brcode …` | `/brcode` |
| Boleto cobrança (Situação 1 + 2) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| Boleto arrecadação (48/44, product `8`) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| Credit card (Luhn / ISO 7812) | `@br-validators/core/cartao-credito` | `br-validators cartao …` | `/cartao-credito` |
| Inscrição Estadual (27 UFs) | `@br-validators/core/inscricao-estadual` | `br-validators ie … --uf SP` | `/ie` |
| IE SP produtor rural | `@br-validators/core/inscricao-estadual-produtor-rural` | `br-validators ie …` (auto `P`) | `/ie` |
| **Platform APIs** | see below | partial | partial |

### Platform APIs (`@br-validators/core`)

| API | Subpath | CLI | Playground | Purpose |
|-----|---------|-----|------------|---------|
| `detect()` | `/detect` | `br-validators detect …` | `/detect` | Auto-classify raw input |
| `sanitize()` | `/sanitize` | `br-validators sanitize <type> …` | `/sanitize` | ETL fixes + validate |
| `mask()` | `/mask` | — | via `format` actions | Unified display mask |
| `compare()` | `/compare` | — | — | Normalized equality |
| `batch()` | `/batch` | — | — | Bulk validate + summary |
| `diff()` | `/diff` | — | — | Field-level structural diff |
| `generate()` | `/generate` | `br-validators generate …` | `/generate` | Synthetic test fixtures |

```typescript
import { compare, batch, diff, mask } from '@br-validators/core';

compare('123.456.789-09', '12345678909', 'cpf'); // { equal: true }
batch(['12345678909', 'bad'], 'cpf');             // { valid, invalid, summary }
diff('12345678909', '12345678901', 'cpf');        // { changed, fields: [{ field: 'dv', … }] }
mask('12345678909', 'cpf');                       // { ok: true, formatted: '123.456.789-09' }
```

### PIX static QR Code (playground)

The **[playground `/pix`](https://doc-raiz-playground.vercel.app/pix)** builds **static PIX BR Code** payloads (Bacen EMV TLV + CRC16) from a validated PIX key:

| Mode | Amount field | Use case |
|------|--------------|----------|
| **Permanent (static)** | Leave empty | Payer chooses the amount at payment time |
| **Fixed value** | e.g. `10.50` | QR encodes tag `54` with the transaction amount |

Payload is validated with `validateBrCode` before rendering the QR image. Official sources: [Bacen Manual BR Code](docs/OFFICIAL-SOURCES.md), [Manual de Padrões PIX](docs/OFFICIAL-SOURCES.md).

Core library ships **`buildStaticPixBrCode`**, **`validateBrCode` / `parseBrCode`**, and **`computeCrc16Ccitt`** via `@br-validators/core/brcode`. QR image rendering remains playground-only (`QrCodePanel` on `/pix`).

Official sources per type: [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md)

### Reference data (offline lookup)

Government classification tables embedded in the library — **zero runtime fetch**, tree-shakeable subpaths, weekly verified freshness.

| Dataset | Library import | CLI | Playground | Key APIs | Official source |
|---------|----------------|-----|------------|----------|-----------------|
| IBGE states + municipalities | `@br-validators/core/ibge` | — | `/data/ibge` | `getEstados`, `getMunicipios`, `getMunicipioPorCodigo` | [IBGE localidades](https://servicodados.ibge.gov.br/api/docs/localidades) |
| Bacen STR banks | `@br-validators/core/bancos` | `bancos lookup` · `bancos list` | `/data/bancos` | `getBancos`, `getBancoPorCodigo`, `getBancoPorIspb` | [Bacen STR CSV](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| DDD geographic lookup | `@br-validators/core/telefone` | — | — | `getDddInfo` | [Anatel DDD panel](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| National holidays | `@br-validators/core/feriados` | — | — | `isFeriadoNacional`, `getFeriadosNacionais`, `getProximoDiaUtil` | [Lei 662/1949](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) |
| CNAE 2.3 subclasses | `@br-validators/core/cnaes` | — | — | `getCnaePorCodigo`, `searchCnaes` | [IBGE CNAE API](https://servicodados.ibge.gov.br/api/docs/cnae) |
| CFOP fiscal operations | `@br-validators/core/cfop` | — | — | `getCfopPorCodigo`, `searchCfop` | [CONFAZ CFOP](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) |
| NCM Mercosur codes | `@br-validators/core/ncm` | — | — | `getNcmPorCodigo`, `searchNcm` | [Siscomex NCM JSON](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) |
| CBO 2002 occupations | `@br-validators/core/cbo` | — | — | `getCboPorCodigo`, `searchCbo` | [MTE CBO CSV](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv) |
| CEP prefix lookup | `@br-validators/core/cep` | — | — | `getCepFaixaInfo`, `getCepFaixas` | [IBGE CNEFE 2022](https://www.ibge.gov.br/estatisticas/sociais/populacao/38734-cadastro-nacional-de-enderecos-para-fins-estatisticos.html) |
| Transparency catalog | `@br-validators/core/data-catalog` | — | `/data/catalog` | `getDataCatalog`, `getDatasetMetadata` | See [DATA-FRESHNESS.md](docs/DATA-FRESHNESS.md) |

```typescript
import { getNcmPorCodigo } from '@br-validators/core/ncm';
import { getCfopPorCodigo } from '@br-validators/core/cfop';
import { getCnaePorCodigo } from '@br-validators/core/cnaes';
import { getDataCatalog } from '@br-validators/core/data-catalog';

getNcmPorCodigo('01012100');   // NCM leaf code lookup
getCfopPorCodigo('1102');      // fiscal operation code
getCnaePorCodigo('6201501');   // economic activity (CNPJ complement)
getDataCatalog();              // all dataset metadata + capture dates
```

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
| `@br-validators/core` | [npm](https://www.npmjs.com/package/@br-validators/core) | `1.3.0` |
| `@br-validators/cli` | [npm](https://www.npmjs.com/package/@br-validators/cli) | `1.3.1` |
| `@br-validators/zod` | [npm](https://www.npmjs.com/package/@br-validators/zod) | `1.3.0` |
| `@br-validators/react-hook-form` | [npm](https://www.npmjs.com/package/@br-validators/react-hook-form) | `1.3.0` |

**v1.3.0** — feriados, fiscal reference (NCM/CFOP/CNAE/CBO), CEP prefix lookup. API frozen until v2.0.0. See [CHANGELOG.md](CHANGELOG.md) and [docs/VERSIONING.md](docs/VERSIONING.md#api-freeze-100).

See [CHANGELOG.md](CHANGELOG.md) for release notes.

### Known gaps

| Gap | Status |
|-----|--------|
| Alphanumeric CPF | Blocked — RFB spec not published |
| `compare` / `batch` / `diff` CLI commands | Library-only — use `@br-validators/core` |
| `@br-validators/adapters-correios` | Planned — CEP HTTP lookup |

---

## License

[MIT](LICENSE) — permanently free and open source. See [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md).
