# Official sources by data type

> **Rule:** No validator ships without a row in this table and at least one test vector from the cited source.
> Last reviewed: June 2026.

---

## Summary table

| Data type | Agency | Official source | Notes |
|-----------|--------|-----------------|-------|
| **CPF** | Receita Federal | [RFB CPF portal](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) | 11 digits, mask `XXX.XXX.XXX-DD`. Modulo 11 weights `10…2` / `11…2`. Golden vectors: **`12345678909`** (UC-001), **`11144477735`** (cross-check). **Alphanumeric CPF planned for 2026 — no official spec yet.** |
| **CNPJ (numeric, current)** | Receita Federal | [CNPJ alfanumérico — Perguntas e Respostas (PDF)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) | Traditional modulo 11, 14 digits. Still valid alongside alphanumeric. |
| **CNPJ (alphanumeric, NEW)** | RFB — **IN RFB nº 2.229/2024** | [RFB CNPJ alfanumérico FAQ (PDF)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) + [SERPRO DV PDF](https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf) | Q14 golden vector: **`12ABC34501DE35`**. ASCII−48, weights per Q14. **VARCHAR(14).** Homologation: [Simulador Nacional CNPJ](https://servicos.receitafederal.gov.br/servico/cnpj-alfa/simular) (Q47). Letters: accept A–Z (Q45). |
| **License plate (Mercosul)** | CONTRAN / DENATRAN | [Resolução CONTRAN 729/2018 (consolidada)](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf), [Anexo I — Resolução 969/2022](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao9692022anexos.pdf) | Format `LLLNLNN` (7 alphanumeric). Legacy `LLLNNNN` still valid — lib must accept both + converter. |
| **CEP** | Correios | [Manual API Busca CEP](https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep) | 8 digits, mask `XXXXX-XXX`. **No check digit.** Golden vectors: **`01310100`** (TECH-STACK), **`20040020`** (cross-check). Format/mask only in core; HTTP lookup in `@br-validators/adapters-correios` (planned). |
| **PIX / BR Code** | Banco Central | [Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf), [Anexo I — Padrões Iniciação PIX (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf), [DICT API v2.9](https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html) | **Key validation (Phase 4):** five types — CPF, CNPJ, email (max 77 lowercase), phone (`+55` mobile), EVP (UUID). Golden: `pix@bcb.gov.br`, `+5510998765432`, `123e4567-e89b-12d3-a456-426655440000`. BR Code payload parsing — separate module. |
| **Boleto** | FEBRABAN | [Convenção da Cobrança FB-0061/2021 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf) | Bank boleto: 47-digit linha digitável (modulo 10 field DVs) + 44-digit código de barras (modulo 11 general DV). **Situação 1** (v1): currency `9`, fator+valor campo 5. **Situação 2** (5b): code `988`, currency `0`, ISPB campo 5. Golden: Santander linha ↔ barcode; synthetic Situação 2 pair in `boleto.situacao2.official.json`. 48-digit arrecadação detected but not validated — Phase 5c. |
| **Credit card** | ISO/IEC 7812 | [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) | PAN 8–19 digits; Luhn modulus-10 per **Annex B**. Golden: Visa `4111111111111111`, Mastercard `5555555555554444`, Amex `378282246310005`, walkthrough `79927398713`. Brand detect (Elo/Hipercard IIN) — best-effort, non-authoritative. No CVV/expiry/authorization. |
| **PIS / PASEP / NIS** | Dataprev / INSS (CNIS) | [SIPREV Regras de Validação v1.14 — RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) | 11 digits, mask `XXX.XXXXX.XX-X`. Modulo 11 per **padrão do NIT**; weights `[3,2,9,8,7,6,5,4,3,2]` on first 10 digits (NIT implementation). Golden: **`10027230888`** (UC-006), **`12056456402`** (cross-check). PIS (Caixa), PASEP (BB), NIS/NIT (CNIS) share the same checksum. **Caixa PIS gov.br page removed (404, June 2026).** |
| **IE — São Paulo (SP)** | SEFAZ-SP | [Sintegra rotina de consistência](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) | 12 digits, dual modulo-11 DVs. Mask `XXX.XXX.XXX.XXX`. Golden: **`110042490114`** / `110.042.490.114`. Vector: `tests/vectors/ie.sp.official.json`. SINTEGRA mirror: [cad_SP.html](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html). Rural `P…` format out of v1 scope. |
| **IE — Mato Grosso (MT)** | SEFAZ-MT | [Portaria Art. 6º — estrutura CCE/MT](https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=) | Canonical 9-digit `13XXXXXXD`; legacy 11-digit zero-pad. Weights `[3,2,9,8,7,6,5,4,3,2]`. Golden: **`130000019`** (canonical) / **`00130000019`** (legacy). Vector: `tests/vectors/ie.mt.official.json`. SINTEGRA mirror: [cad_MT.html](http://www.sintegra.gov.br/Cad_Estados/cad_MT.html). |
| **IE — Distrito Federal (DF)** | Receita DF / CF/DF | [Receita Fazenda DF](https://www.receita.fazenda.df.gov.br/) | 13 digits, prefix `07`, dual modulo-11 DVs. Mask `073.XXXXX.XXX-XX`. Golden: **`0730000100109`** / `073.00001.001-09`. Vector: `tests/vectors/ie.df.official.json`. SINTEGRA mirror: [cad_DF.html](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html). Legacy 12-digit rejected (Decreto 18.955/1997). |

---

## Critical timeline: CNPJ alphanumeric

| Milestone | Date | Impact on library |
|-----------|------|-------------------|
| SEFAZ homologation window opens | April 2026 | Consumers need dual-format validation in test environments |
| Production rollout | July 2026 | Both formats must work in production |
| Alphanumeric CPF spec | TBD 2026 | Do not implement until RFB publishes official algorithm |

---

## Alphanumeric CNPJ — official clarifications (RFB FAQ)

| Topic | RFB answer | Library behavior |
|-------|------------|------------------|
| Excluded letters | Q45: systems accept **all A–Z**; RFB blocks bad combos at issuance | No client-side letter blocklist |
| Coexistence | Q6–Q7, Q20: numeric + alphanumeric both valid | Dual-path validator |
| Mask | Q21: same `XX.XXX.XXX/XXXX-DD` for both | Single formatter |
| Golden test | Q14: `12ABC34501DE35` | Mandatory unit test vector |
| QA tool | Q47: Simulador Nacional CNPJ | Manual homologation only |

---

## Source verification protocol

Before merging a validator:

1. Add or update row in this table with URL and access date.
2. Add test vectors from the official example or worked calculation.
3. Cross-check with at least one independent implementation **only after** primary source is satisfied.
4. Document known edge cases (e.g. CPF/CNPJ with all equal digits — traditionally rejected as invalid).

---

## References index

- RFB CPF: https://www.gov.br/receitafederal/pt-br/assuntos/cpf
- RFB CNPJ FAQ PDF: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf
- SERPRO DV calculation: https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf
- RFB Simulador CNPJ: https://servicos.receitafederal.gov.br/servico/cnpj-alfa/simular
- Correios CEP API manual: https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep
- CONTRAN 729/2018: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
- CONTRAN 969/2022 Anexo I: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao9692022anexos.pdf
- SIPREV PIS/PASEP RV_03: https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf
- Bacen BR Code: https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf
- Bacen PIX initiation: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
- Bacen DICT API v2.9: https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html
- FEBRABAN Convenção da Cobrança: https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf
- ISO/IEC 7812-1:2017: https://www.iso.org/standard/70484.html
- IE state index: [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md)
- IE SP (SEFAZ): https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx
- IE SP (SINTEGRA mirror): http://www.sintegra.gov.br/Cad_Estados/cad_SP.html
- IE MT (SEFAZ structure): https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=
- IE MT (SINTEGRA mirror): http://www.sintegra.gov.br/Cad_Estados/cad_MT.html
- IE DF (Receita / CF/DF): https://www.receita.fazenda.df.gov.br/
- IE DF (SINTEGRA mirror): http://www.sintegra.gov.br/Cad_Estados/cad_DF.html
