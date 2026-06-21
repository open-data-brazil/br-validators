# Frontmatter Schema

> Every rule file under `rules/` (except root docs) uses YAML frontmatter for conditional loading.

## Format

```yaml
---
id: category.rule-name          # stable identifier
triggers:                       # keywords for harness/resolve-rules.sh
  - keyword-one
  - keyword-two
alwaysApply: false              # true only for base rules (rare in rules/)
---
```

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Dot-namespaced ID (e.g. `sec.authz`) |
| `triggers` | yes | Lowercase keywords; matched against task description |
| `alwaysApply` | yes | `false` for modular rules; base load via `manifest.yaml` `always_apply` |

## Base load (always)

Defined in `rules/manifest.yaml` → `always_apply`:

- `AGENT-CORE-PRINCIPLES.md`
- `09-ai-agent-specific/token-economy.md`
- `09-ai-agent-specific/anti-hallucination.md`

## Regenerate frontmatter

After editing `manifest.yaml`:

```bash
python3 harness/inject-frontmatter.py
```

## Writing style for agent rules

1. **Imperative one-liners** for hard limits.
2. **Bullets/tables** for lists and exceptions.
3. **Reference** glossary and other rules — no re-definition.
4. **English only** — plain technical vocabulary.

Human-facing rationale → `harness/README.md` or project docs, not agent rule files.
