# @br-validators/cli

Terminal CLI for all Brazilian document validators in [@br-validators/core](https://www.npmjs.com/package/@br-validators/core).

**Repo:** [github.com/AlexandreZanata/br-validators](https://github.com/AlexandreZanata/br-validators)

---

## Install

```bash
npm install -g @br-validators/cli
```

Or run without install:

```bash
npx @br-validators/cli --help
```

---

## Commands

```bash
br-validators list
br-validators --version

br-validators cnpj validate 12ABC34501DE35 --json --source
br-validators cpf validate 12345678909
br-validators cep format 01310100
br-validators placa validate ABC1D23
br-validators pis-pasep validate 10027230888
br-validators pix validate pix@bcb.gov.br
br-validators boleto validate <linha-ou-barcode>
br-validators cartao validate 4111111111111111
br-validators ie validate 110042490114 --uf SP --json
```

### Actions (all types)

| Action | Description |
|--------|-------------|
| `validate` | Check format + check digits |
| `format` | Apply official mask |
| `strip` | Normalize to canonical digits/chars |

### Flags

| Flag | Description |
|------|-------------|
| `--json` | JSON output (`ValidationResult`) |
| `--quiet` / `-q` | Exit code only (CI) |
| `--file` / `-f` | Read value from file |
| `--source` | Print official source URL |
| `--uf` | Required for IE (27 UFs) |

### CI

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
```

---

## License

MIT
