---
id: ai.token
triggers:
  - token
  - context
  - load
  - modular
alwaysApply: false
---
# Token Economy

> Load less, execute better. Modular rules exist for this principle.

## What actually saves tokens (and improves accuracy)

| Technique | Why it works |
|-----------|--------------|
| **Modular files** | Load `03-security/authorization.md` for auth tasks — not all 50+ rules at once |
| **Plain technical English** | Common terms (`validate`, `escape`, `default-deny`) are BPE-efficient in English |
| **Short imperatives** | `Never hardcode secrets` (4 tokens) beats encoded prose |
| **Bullets over prose** | Drops connectives without losing clarity |
| **Tables for exceptions** | Denser than paragraphs for the same rules |
| **Reference, don't repeat** | Define term once in glossary; other rules link to it |

## Harness practices (this repo)

### Conditional loading

- Agent loads only rules matching the current task.
- Use: `./harness/resolve-rules.sh api endpoint auth`
- Read `rules/manifest.yaml` for trigger index.

### YAML frontmatter triggers

Each rule file declares when it applies:

```yaml
---
id: sec.authz
triggers:
  - authorization
  - authz
  - bola
alwaysApply: false
---
```

Match task keywords to triggers — do not load unrelated files.

### One-line rules when possible

| Rule | Format |
|------|--------|
| Max function length | `Max function length: 30 lines` |
| Cyclomatic complexity | `Cyclomatic complexity: hard cap 10, target 5` |
| Default deny | `Authorization: default-deny, server-side only` |

Rationale belongs in human README — agent rules stay terse.

## Agent MUST

- **Reference** paths, not paste full files.
- **Load** 2–6 rule files per task via triggers or `resolve-rules.sh`.
- **Generate** large files incrementally — scaffold, fill, verify each section.
- **Reuse** existing utilities — search before creating helpers.
- **Summarize** exploration — no file dumps unless user asks.

## Agent NEVER

- Load entire `rules/` tree for a one-line fix.
- Re-explain glossary terms — link to `11-documentation-and-glossary/ubiquitous-language.md`.
- Repeat `AGENT-CORE-PRINCIPLES.md` content in chat — cite section.

## Response discipline

- Cite: `src/domain/Order.ts` — not full file contents.
- One logical concern per turn when possible.

## Before reading 10+ files

1. Run `./agent-harness/resolve-rules.sh <keywords from task>`.
2. Read `agent-rules/STRUCTURE.md` task mapping if keywords unclear.
3. State which rule files you loaded (brief list).
