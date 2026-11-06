# Adapter RFC — `@br-validators/adapters-pncp`

> **Status:** RFC (not implemented in core)  
> **Core embed:** `@br-validators/core/pncp-reference` — static domain tables only

---

## Scope

| Operation | Delivery |
|-----------|----------|
| Modalidade / amparo legal lookup | `@br-validators/core/pncp-reference` (embedded) |
| Contract search by CNPJ | Adapter — paginated live Consulta API |
| Contratação by org/year/sequencial | Adapter — live API |
| PCA bulk listing | Out of scope v1 |

---

## API surface (Consulta)

| Item | Value |
|------|-------|
| Base | `https://pncp.gov.br/api/consulta` |
| OpenAPI | https://pncp.gov.br/api/consulta/v3/api-docs |
| Swagger | https://pncp.gov.br/api/consulta/swagger-ui/index.html |

### Query endpoints (adapter)

| Path | CNPJ parameter |
|------|----------------|
| `GET /v1/contratos` | `cnpjOrgao` |
| `GET /v1/contratacoes/publicacao` | `cnpj` |
| `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}` | `cnpj` (path) |
| `GET /v1/atas` | `cnpj` |

Full classification: `.local/phases/26b-pncp-consulta/OFFICIAL-REFERENCE.md`

---

## Requirements

1. Normalize CNPJ with `normalizePncpCnpj` (`stripCnpj`) before every query.
2. Respect PNCP rate limits — cache responses with TTL (suggest 15–60 min for contract lists); exponential backoff on 429/5xx.
3. Paginate with `pagina` / `tamanhoPagina` (max 500) — never assume single-page results.
4. Log request metadata only — redact contractor CNPJ in production logs (mask middle digits).
5. Human confirmation before persisting query results in agentic workflows (ASI rule).

---

**Updated:** 2026-06-23
