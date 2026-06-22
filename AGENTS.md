# AGENTS.md — Universal Entry Point for Coding Agents

> **Read this first** in any new agent session (Cursor, Claude Code, Codex, Windsurf, etc.).

**Project:** br-validators  
**Language:** 100% English — code, comments, docs, commits, and all agent output.

When rules conflict with existing code, **rules prevail** — unless the user explicitly overrides for a task.

---

## Rules path (resolve first)

```bash
pip install -r agent-harness/requirements.txt   # once per machine
./agent-harness/rules-path.sh
```

| Config file | `rules_dir` |
|-------------|-------------|
| `agent-harness/harness.config.yaml` | `agent-rules/` |

Paths are relative to **project root**. Never hardcode `rules/` — use output from `rules-path.sh`.

---

## Always load (base context)

Read these files at session start or before non-trivial work:

1. `agent-rules/AGENT-CORE-PRINCIPLES.md` — architecture contract
2. `agent-rules/09-ai-agent-specific/token-economy.md` — load less, execute better
3. `agent-rules/09-ai-agent-specific/anti-hallucination.md` — verify before assert

Cursor users: `.cursor/rules/*.mdc` applies automatically (`alwaysApply`).

---

## Conditional load (task-specific)

Load **2–6 files only** — not the entire rule tree.

```bash
./agent-harness/resolve-rules.sh <keywords from task>
```

| Task | Example keywords |
|------|------------------|
| API endpoint | `api endpoint auth validation contract` |
| Security review | `owasp security authz bola agentic` |
| Domain feature | `domain layer state event` |
| Bug fix | `bugfix regression error` |
| Performance | `query cache n+1` |

Match rule file `triggers:` in YAML frontmatter, or use output from `resolve-rules.sh`.

### Cursor: task-scoped rule file (optional)

```bash
./agent-harness/generate-task-rules.sh api endpoint auth
```

Creates `.cursor/rules/_task-active.mdc` (`alwaysApply: false`, gitignored). **Delete when done:**

```bash
./agent-harness/generate-task-rules.sh --clean
```

**Index:** `agent-rules/STRUCTURE.md`  
**Manifest:** `agent-rules/manifest.yaml`  
**Security map:** `agent-rules/03-security/README.md`

---

## Agent protocol

1. Run `./agent-harness/rules-path.sh` → know `{rules_dir}`.
2. Identify task keywords → run `./agent-harness/resolve-rules.sh`.
3. State which rule files you loaded (brief list).
4. **ASK** if AGENT-CORE-PRINCIPLES checklist items are blank — never assume business rules.
5. Smallest diff; one logical change per commit.
6. Verify after each edit — do not claim tests passed without running them.
7. English only in all artifacts.

---

## Project docs (fill before coding)

| Document | Purpose |
|----------|---------|
| [docs/NEW-PROJECT-CHECKLIST.md](docs/NEW-PROJECT-CHECKLIST.md) | Pre-coding checklist |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | Domain terms |
| [docs/API-CONTRACT.md](docs/API-CONTRACT.md) | API sketch |
| [docs/use-cases/](docs/use-cases/) | Use case files |

---

## Key references

| Document | Purpose |
|----------|---------|
| [agent-rules/AGENT-CORE-PRINCIPLES.md](agent-rules/AGENT-CORE-PRINCIPLES.md) | Domain architecture contract |
| [agent-rules/STRUCTURE.md](agent-rules/STRUCTURE.md) | Full rule tree + task mapping |
| [agent-rules/03-security/OWASP-TOP10-2025.md](agent-rules/03-security/OWASP-TOP10-2025.md) | Web/API security (A01–A10) |
| [agent-rules/03-security/OWASP-AGENTIC-2026.md](agent-rules/03-security/OWASP-AGENTIC-2026.md) | Agentic AI security (ASI01–ASI10) |
| [agent-harness/README.md](agent-harness/README.md) | Install, resolve, maintenance |

---

## Optional local overrides

Project-specific rules not in harness: `.local/overrides/` (gitignored). Harness rules still apply unless user explicitly waives.
