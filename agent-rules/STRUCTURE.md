# Full Topic Structure — Agent Harness

> **Language:** 100% English across this repository and all generated artifacts.
> **Loading:** Conditional via `triggers` frontmatter + `harness/resolve-rules.sh`.
> **Precedence:** `rules/AGENT-CORE-PRINCIPLES.md` overrides conflicting code or assumptions.

```
rules/
├── AGENT-CORE-PRINCIPLES.md     # Architecture contract (always_apply)
├── STRUCTURE.md                 # This index
├── manifest.yaml                # Trigger index for conditional loading
├── FRONTMATTER-SCHEMA.md        # Frontmatter format
│
├── 00-core/                     # Agent behavior, decisions, change discipline
├── 01-clean-code/               # Naming, complexity, SOLID, errors
├── 02-architecture/             # Layers, events, state machines, DI
├── 03-security/                 # OWASP 2025-aligned + Agentic 2026 (ASI01–ASI10)
│   ├── README.md                # Security index + standards mapping
│   ├── OWASP-TOP10-2025.md
│   ├── OWASP-AGENTIC-2026.md
│   └── agentic/                 # ASI01–ASI10 rule files
├── 04-testing/                  # TDD, pyramid, coverage, regression
├── 05-performance-and-scalability/
├── 06-reliability-and-observability/
├── 07-data-management/
├── 08-devops-and-delivery/
├── 09-ai-agent-specific/        # Token economy, anti-hallucination
├── 10-api-design/
└── 11-documentation-and-glossary/

harness/
├── install.sh                   # Install into any project
├── resolve-rules.sh             # Keyword → rule files
└── inject-frontmatter.py        # Regenerate frontmatter from manifest

.cursor/rules/                   # Cursor alwaysApply entry points
```

## Resolve rules for a task

```bash
./harness/resolve-rules.sh api endpoint auth
# → lists matching rule paths under rules/
```

## Task → keyword mapping

| Task type | Keywords |
|-----------|----------|
| New feature / domain | `domain layer state event agent` |
| API endpoint | `api endpoint controller auth validation contract` |
| Security review | `security owasp agentic authz bola injection` |
| Bug fix | `bugfix regression error` |
| Performance | `query cache n+1 async` |
| Agent self-governance | `token context agent verify` |

## File inventory (61 modular rules)

All files under `rules/` include YAML frontmatter with `triggers`. See `manifest.yaml` for the full index.

### 00-core (3) · 01-clean-code (7) · 02-architecture (7) · 03-security (28 files: 15 core + 10 agentic + 3 index)
### 04-testing (5) · 05-performance (4) · 06-reliability (4) · 07-data (4)
### 08-devops (4) · 09-ai-agent (4) · 10-api (3) · 11-docs (3)

## Install in another project

```bash
git submodule add https://github.com/AlexandreZanata/GoodPraticesForLLMSandAgents.git .agent-harness
./.agent-harness/harness/install.sh .
```

Or copy mode: `./harness/install.sh /path/to/your-project`
