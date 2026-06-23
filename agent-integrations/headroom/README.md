# Headroom Integration (Cursor + Agents)

> **Third-party:** [Headroom](https://github.com/headroomlabs-ai/headroom) — Apache License 2.0  
> Attribution: [ATTRIBUTION.md](./ATTRIBUTION.md)

Headroom is a **context compression layer** for AI agents. It compresses tool outputs, logs, files, and RAG chunks before they reach the LLM — **60–95% fewer tokens**, same answers. Runs **locally**.

This harness installs Headroom **alongside** `.cursor/rules` and `agent-rules/` — not as a replacement.

---

## Quick start (Cursor)

```bash
# From harness repo or installed project
./agent-integrations/headroom/setup.sh
./agent-integrations/headroom/setup.sh --wrap   # print Cursor config to paste
```

Or manually:

```bash
pip install "headroom-ai[all]"   # Python 3.10+
headroom wrap cursor             # follow printed instructions
```

**Proxy alternative** (zero code change):

```bash
headroom proxy --port 8787
# Configure Cursor to use http://localhost:8787
```

---

## How it fits this harness

| Layer | Purpose |
|-------|---------|
| `agent-rules/` | **What** the agent must do (architecture, security, TDD) |
| `.cursor/rules/` | **Always-on** agent behavior (English, token economy) |
| **Headroom** | **How much context** reaches the LLM (compression) |

Use both: rules reduce *what you load*; Headroom compresses *what the model receives*.

---

## Daily workflow

```bash
# 1. Harness rules (task-specific)
./agent-harness/resolve-rules.sh api performance

# 2. Optional task rule for Cursor
./agent-harness/generate-task-rules.sh api export

# 3. Headroom runs via wrap/proxy automatically once configured

# 4. Cleanup task rule when done
./agent-harness/generate-task-rules.sh --clean
```

---

## Verify savings

```bash
headroom perf
headroom output-savings   # after output shaper enabled
```

---

## Requirements

| Requirement | Notes |
|-------------|-------|
| Python | 3.10+ |
| Local process | Does not work in fully sandboxed environments |
| Network | First run may download models (HuggingFace, ONNX) |

Corporate SSL: see [Headroom install docs](https://github.com/headroomlabs-ai/headroom#corporate--ssl-inspection-environments).

---

## Agent compatibility

| Agent | Command |
|-------|---------|
| **Cursor** | `headroom wrap cursor` |
| Claude Code | `headroom wrap claude` |
| Codex | `headroom wrap codex` |
| Any OpenAI client | `headroom proxy --port 8787` |

Full matrix: https://github.com/headroomlabs-ai/headroom#agent-compatibility-matrix

---

## License

Headroom: **Apache 2.0** — https://github.com/headroomlabs-ai/headroom/blob/main/LICENSE

This integration folder (docs + scripts): MIT (same as Agent Harness repo).
