# Dev.to — Brazilian data toolkit for TypeScript

> **Status:** Outline for publication (English)  
> **Tags:** `typescript`, `brazil`, `opensource`  
> **Target length:** ~1,200 words

---

## Title options

1. **A TypeScript toolkit for Brazilian CPF, CNPJ, and 17 offline gov datasets**
2. **Stop guessing Brazilian document validation — use official algorithms in TypeScript**

---

## Hook (opening paragraph)

Brazilian fintech and ERP teams routinely reimplement CPF modulo-11, CNPJ check digits, and SEFAZ-specific rules — often diverging from Receita Federal, Bacen, and state tax authority specs. **BR Validators v1.5.0** ships **18 document validators** and **17 embedded government reference datasets** (IBGE, NCM, CFOP, Bacen banks, national holidays, …) as a single MIT monorepo: `@br-validators/core` on npm, with Zod, React Hook Form, Express, and Vue adapters.

---

## Section 1 — Alphanumeric CNPJ (RFB 2026)

**Talking points:**

- IN RFB nº 2.229/2024 — production rollout July 2026
- Golden vector from RFB FAQ Q14: `12ABC34501DE35`
- Same `validateCnpj()` accepts numeric and alphanumeric

**Code sample:**

```typescript
import { validateCnpj, formatCnpj } from '@br-validators/core/cnpj';

const result = validateCnpj('12ABC34501DE35');
if (result.ok) {
  console.log(formatCnpj(result.value).formatted);
}
```

**Official source:** [RFB CNPJ alfanumérico FAQ (PDF)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf)

---

## Section 2 — Offline NCM lookup (no runtime API)

**Talking points:**

- Siscomex NCM JSON embedded offline
- Weekly refresh bot from government sources
- `getNcmPorCodigo`, `searchNcm`

**Code sample:**

```typescript
import { getNcmPorCodigo } from '@br-validators/core/ncm';

const leaf = getNcmPorCodigo('01012100');
console.log(leaf?.descricao);
```

**Official source:** [Siscomex NCM JSON](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json)

---

## Section 3 — Batch validation for ETL pipelines

**Talking points:**

- `batch()` with summary counts
- Pairs with `sanitize()` for ETL fixes
- Never throws on invalid rows

**Code sample:**

```typescript
import { batch } from '@br-validators/core';

const summary = batch(
  [
    { id: 1, cpf: '12345678909' },
    { id: 2, cpf: '00000000000' },
  ],
  'cpf',
  { field: 'cpf' },
);
console.log(summary.valid, summary.invalid);
```

---

## Section 4 — Framework adapters (same core)

Brief bullets:

- `@br-validators/zod` — schema factories
- `@br-validators/react-hook-form` — `cpfRule()`
- `@br-validators/express` — `brValidate({ body: { cpf: 'cpf' } })`
- `@br-validators/vue` — `useCpf()` composable

---

## CTA (closing)

```bash
npm install @br-validators/core
```

- **Playground (client-side, no PII to server):** https://doc-raiz-playground.vercel.app/
- **Docs site:** https://docs.br-validators.dev/ (VitePress)
- **GitHub:** https://github.com/AlexandreZanata/br-validators
- **Contributing:** RG remaining 21 UFs — `good first issue` label

---

## Cover image ideas

- Split panel: CNPJ alphanumeric input + green validation badge
- Map of Brazil with dataset icons (IBGE, Bacen, Siscomex)

---

## Pre-publish checklist

- [ ] Verify npm version badge matches release
- [ ] Link to OFFICIAL-SOURCES.md for credibility
- [ ] Cross-post summary to GitHub Discussions (optional)
