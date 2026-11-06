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
      link: https://open-data-brazil.github.io/br-validators/

features:
  - title: Official algorithms
    details: CPF, CNPJ (numeric + alphanumeric), CEP, PIX, IE (27 UFs), boleto, and more — each traced to RFB, Bacen, CONTRAN, or SEFAZ sources.
  - title: Offline reference data
    details: IBGE, NCM, CFOP, CNAE, Bacen banks, national holidays — embedded JSON refreshed daily from government APIs.
  - title: Framework adapters
    details: Zod, React Hook Form, Express/Fastify, and Vue 3 composables delegate to the same core validators.
---

## Quick install

```bash
VERSION=$(curl -fsSL https://api.github.com/repos/open-data-brazil/br-validators/releases/latest | jq -r .tag_name | sed 's/^v//')
pnpm add "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-core-$VERSION.tgz"
```

Distributed as [GitHub Release](https://github.com/open-data-brazil/br-validators/releases) assets (no npm registry) — see [Install](/guide/install).

Deep API reference: [Library API](/api/library-api) (auto-synced from the monorepo).
