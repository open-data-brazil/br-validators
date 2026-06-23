## Weekly data refresh — 2026-06-23

| Dataset | Records | + added | − removed | ~ changed | Captured | Source |
|---------|---------|---------|-----------|-----------|----------|--------|
| ibge | 27 estados / 5571 municipios | 0 | 0 | 0 | 2026-06-23 | [official](https://servicodados.ibge.gov.br/api/v1/localidades/estados) |
| bancos | 468 bancos | 0 | 0 | 0 | 2026-06-23 | [official](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| telefone-ddd | 67 ddds | 0 | 0 | 0 | 2026-06-23 | [official](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| feriados | 9 feriadosNacionaisFixos / 1 feriadosNacionaisMoveis / 9 pontosFacultativosFederais | 0 | 0 | 0 | 2026-06-23 | [official](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) |
| cnaes | 1332 cnaes | 1332 | 0 | 0 | 2026-06-23 | [official](https://servicodados.ibge.gov.br/api/v2/cnae/subclasses) |
| cfop | 689 cfop | 689 | 0 | 0 | 2026-06-23 | [official](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente) |
| ncm | 10515 ncm | 10515 | 0 | 0 | 2026-06-23 | [official](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json) |
| cbo | 2694 cbo | 2694 | 0 | 0 | 2026-06-23 | [official](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv) |
| cep-faixas | 24649 faixas | 24649 | 0 | 0 | 2026-06-23 | [official](https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF) |

**Totals:** +39879 −0 ~0

### Source health

All official endpoints responded successfully.

### Verification

- [ ] `pnpm verify` passed
- [ ] All endpoints are official government domains
- [ ] No unresolved `sourceAlerts` (or documented in PR if retention is expected)
- [ ] Human review required before merge
