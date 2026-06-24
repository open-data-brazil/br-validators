---
layout: home

hero:
  name: BR Validators
  text: Brazilian documents & data for TypeScript
  tagline: 18 validators · 17 offline government datasets · 100% open source (MIT)
  actions:
    - theme: brand
      text: Get started
      link: /guide/
    - theme: alt
      text: Library API
      link: /api/library-api
    - theme: alt
      text: Try the playground
      link: https://doc-raiz-playground.vercel.app/

features:
  - title: Official algorithms
    details: CPF, CNPJ (numeric + alphanumeric), CEP, PIX, IE (27 UFs), boleto, and more — each traced to RFB, Bacen, CONTRAN, or SEFAZ sources.
  - title: Offline reference data
    details: IBGE, NCM, CFOP, CNAE, Bacen banks, national holidays — embedded JSON refreshed weekly from government APIs.
  - title: Framework adapters
    details: Zod, React Hook Form, Express/Fastify, and Vue 3 composables delegate to the same core validators.
---

## Quick install

```bash
pnpm add @br-validators/core
```

Deep API reference: [Library API](/api/library-api) (auto-synced from the monorepo).
