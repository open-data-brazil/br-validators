# Official sources

::: info Canonical document
This page mirrors [docs/OFFICIAL-SOURCES.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/OFFICIAL-SOURCES.md) in the monorepo. Edit there for normative updates.
:::

Every validator ships with:

- A row in the official-sources table
- At least one golden test vector from the cited source
- `get*OfficialSourceUrl()` or constant map where applicable

## Summary (v1.5.0 validators)

| Type | Agency | Primary source |
|------|--------|----------------|
| CPF | Receita Federal | [RFB CPF portal](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) |
| CNPJ | RFB / SERPRO | [CNPJ alfanumérico FAQ (PDF)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) |
| CEP | Correios | [Manual API Busca CEP](https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep) |
| Telefone | Anatel | [Plano de Numeração](https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro) |
| PIX | Bacen | [Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf) |
| IE (27 UFs) | SEFAZ | Per-UF — see monorepo `IE_OFFICIAL_SOURCE_URLS` |
| RG (6 UFs phase 1) | SSP/IGP | [RG reference index](https://github.com/AlexandreZanata/br-validators/blob/main/docs/OFFICIAL-SOURCES.md#rg--reference-index) |

Full table (18 document types + 17 datasets): [OFFICIAL-SOURCES.md on GitHub](https://github.com/AlexandreZanata/br-validators/blob/main/docs/OFFICIAL-SOURCES.md).
