# Delivery surfaces — library, CLI, playground

> Every Brazilian document type supported by the library is also testable via **CLI** and **web playground**.
> All three surfaces call the same TypeScript core — no duplicated algorithms.

---

## Three surfaces, one core

```
                    ┌─────────────────────────┐
                    │  packages/br-validators │
                    │  (strip / validate /    │
                    │   format — pure TS)     │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   import in app          br-validators           apps/playground
   (npm package)          (terminal CLI)          (Vercel web UI)
```

| Surface | User | Use case |
|---------|------|----------|
| **Library** | Developers | Embed in API, forms, ETL |
| **CLI** | Devs, DevOps, support | Quick check, CI gates, scripts |
| **Playground** | Anyone | Try validators without installing; demos, docs |

---

## Per document type matrix

As each module ships, **all three** must be updated:

| Type | Library export | CLI command | Playground tab | Official source |
|------|----------------|-------------|----------------|-----------------|
| CNPJ | `br-validators/cnpj` | `br-validators cnpj …` | CNPJ | [RFB PDF](OFFICIAL-SOURCES.md) |
| CPF | `br-validators/cpf` | `br-validators cpf …` | CPF | RFB |
| CEP | `br-validators/cep` | `br-validators cep …` | CEP | Correios |
| Placa | `br-validators/placa` | `br-validators placa …` | Placa | CONTRAN |
| PIX key | `br-validators/pix` | `br-validators pix …` | PIX | Bacen |
| Boleto | `br-validators/boleto` | `br-validators boleto …` | Boleto | FEBRABAN |
| IE | `br-validators/ie` | `br-validators ie …` | IE (per UF) | SEFAZ |

**Definition of done per module:** library tests green + CLI command + playground section + source link.

---

## CLI specification

### Global

```bash
br-validators --version
br-validators --help
br-validators list
```

### Per-type actions

Every type implements the same actions where applicable:

| Action | Description |
|--------|-------------|
| `validate` | Check format + check digits |
| `format` | Apply official mask (valid input only) |
| `strip` | Normalize input |

```bash
br-validators <type> validate <value>
br-validators <type> format <value>
br-validators <type> strip <value>
```

### Flags (all types)

| Flag | Description |
|------|-------------|
| `--json` | JSON output (`ValidationResult`) |
| `--quiet` / `-q` | Exit code only |
| `--file` / `-f` | Read value from file (one line) |
| `--source` | Print official source URL for this type |

### JSON example

```bash
$ br-validators cnpj validate 12ABC34501DE35 --json
{
  "ok": true,
  "value": "12ABC34501DE35",
  "format": "alphanumeric",
  "formatted": "12.ABC.345/01DE-35",
  "source": "https://www.gov.br/receitafederal/.../cnpj-alfanumerico.pdf"
}
```

### CI usage

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
```

---

## Playground (Vercel) specification

### URL

Production: `https://br-validators.vercel.app` (TBD at deploy)

### Pages

| Route | Content |
|-------|---------|
| `/` | Landing + type selector |
| `/cnpj` | CNPJ tester |
| `/cpf` | CPF tester |
| `/[type]` | Generic layout for each doc type |

### Component layout (clean UI)

```
┌──────────────────────────────────────────────────────┐
│  BR Validators Playground          [Type: CNPJ ▼]    │
├──────────────────────────────────────────────────────┤
│  Input                                               │
│  ┌────────────────────────────────────────────────┐  │
│  │ 12.ABC.345/01DE-35                             │  │
│  └────────────────────────────────────────────────┘  │
│  [ Validate ]  [ Format ]  [ Strip ]                 │
├──────────────────────────────────────────────────────┤
│  Strip     12ABC34501DE35                            │
│  Valid     ✓ yes — alphanumeric                      │
│  Format    12.ABC.345/01DE-35                        │
├──────────────────────────────────────────────────────┤
│  Official source ↗ RFB CNPJ alfanumérico (Q14)       │
│  npm: br-validators  ·  CLI: br-validators cnpj …    │
└──────────────────────────────────────────────────────┘
```

### Principles

- **Client-side only** — no API route sends PII to server
- **Minimal design** — fast load, accessible, mobile-friendly
- **Official source link** on every page
- **Copy buttons** for CLI command equivalent
- Open source — playground code in `apps/playground/`

### Deploy

```bash
cd apps/playground
vercel deploy --prod
```

Monorepo: Vercel root directory = `apps/playground`, build depends on `packages/br-validators`.

---

## Implementation order

| Step | Deliverable |
|------|-------------|
| 1 | `packages/br-validators` — CNPJ core |
| 2 | `apps/cli` — `cnpj validate|format|strip` |
| 3 | `apps/playground` — CNPJ tab on Vercel |
| 4 | Add CPF to all three surfaces |
| 5 | Repeat for CEP, placa, PIX, … |

See [TECH-STACK.md](TECH-STACK.md) and [ROADMAP.md](ROADMAP.md).

---

## Related

| Doc | Purpose |
|-----|---------|
| [TECH-STACK.md](TECH-STACK.md) | TypeScript-first rationale |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Monorepo structure |
| [LIBRARY-API.md](LIBRARY-API.md) | Function contracts |
