# @br-validators/core

100% open-source Brazilian document validators (MIT).

**npm:** [`@br-validators/core`](https://www.npmjs.com/package/@br-validators/core)  
**Repo:** [github.com/AlexandreZanata/br-validators](https://github.com/AlexandreZanata/br-validators)

> The unscoped name `br-validators` on npm is a different package. Use **`@br-validators/core`**.

---

## Install

```bash
npm install @br-validators/core
```

Requires Node ≥ 18. ESM only (`"type": "module"`).

---

## Supported types

| Module | Functions | Golden vector |
|--------|-----------|---------------|
| CNPJ | `validateCnpj`, `formatCnpj`, `stripCnpj` | `12ABC34501DE35` |
| CPF | `validateCpf`, `formatCpf`, `stripCpf` | `12345678909` |
| CEP | `validateCep`, `formatCep`, `stripCep` | `01310100` |
| Telefone | `validateTelefone`, `formatTelefone`, `stripTelefone` | `11999999999` |
| CNH | `validateCnh`, `formatCnh`, `stripCnh` | `62472927637` (11 digits, no CPF mask) |
| Placa | `validatePlaca`, `formatPlaca`, `convertPlacaToMercosul` | `ABC1D23` |
| PIS/PASEP | `validatePisPasep`, `formatPisPasep` | `10027230888` |
| PIX key | `validatePixKey`, `formatPixKey` | `pix@bcb.gov.br` |
| Boleto | `validateBoleto`, `formatBoleto` | Situação 1 + 2 |
| Credit card | `validateCartaoCredito`, `passesLuhn` | `4111111111111111` |
| IE (27 UFs) | `validateInscricaoEstadual`, `validateIeSp`, … | per UF — see docs |

Subpath imports for tree-shaking:

```typescript
import { validateCnpj } from '@br-validators/core/cnpj';
import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';
```

---

## Examples

```typescript
import { validateCnpj, formatCnpj } from '@br-validators/core';

const result = validateCnpj('12ABC34501DE35');
// { ok: true, value: '12ABC34501DE35', format: 'alphanumeric', ... }

formatCnpj('12ABC34501DE35');
// { ok: true, formatted: '12.ABC.345/01DE-35', ... }
```

```typescript
import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';

validateInscricaoEstadual('110042490114', { uf: 'SP' });
validateInscricaoEstadual('0730000100109', { uf: 'DF' });
```

---

## Official sources

Every algorithm cites a primary government source. Full table: [OFFICIAL-SOURCES.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/OFFICIAL-SOURCES.md)

Per-type URLs also available via constants (`CNPJ_OFFICIAL_SOURCE_URL`, `IE_OFFICIAL_SOURCE_URLS`, etc.).

---

## API reference

[docs/LIBRARY-API.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/LIBRARY-API.md)

---

## CLI companion

```bash
npm install -g @br-validators/cli
br-validators cnpj validate 12ABC34501DE35 --json
```

---

## License

MIT
