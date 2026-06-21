---
id: sec.agentic-index
triggers:
  - agentic
  - owasp-agentic
  - asi
  - ai-agent
  - mcp
alwaysApply: false
---
# OWASP Top 10 for Agentic Applications:2026

> ASI01–ASI10. Published OWASP GenAI Security Project (December 2025). Applies to coding agents, autonomous workflows, tool-using LLMs.

Official: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

## When to load

- Project uses AI agents with tools, memory, or multi-agent orchestration
- Cursor/Claude Code/Codex acting autonomously on codebase
- Any `@agent` with write/exec/network permissions

```bash
./harness/resolve-rules.sh agentic tool memory rogue
```

## ASI01 — Agent Goal Hijack

→ `agentic/agent-goal-hijack.md`

Indirect prompt injection via docs, APIs, web content redirecting agent goals.

## ASI02 — Tool Misuse and Exploitation

→ `agentic/tool-misuse.md`

Legitimate tools used outside intended scope (exfiltration, privilege escalation).

## ASI03 — Identity and Privilege Abuse

→ `agentic/identity-privilege-abuse.md`

Agent credentials exceed task scope; stale tokens; shared service accounts.

## ASI04 — Agentic Supply Chain Vulnerabilities

→ `agentic/agentic-supply-chain.md`

Third-party prompts, MCP servers, sub-agents, skill packs without verification.

## ASI05 — Unexpected Code Execution

→ `agentic/unexpected-code-execution.md`

Agent-generated or agent-fetched code executed without sandbox/review.

## ASI06 — Memory and Context Poisoning

→ `agentic/memory-context-poisoning.md`

Poisoned RAG, session memory, or rule files altering future agent behavior.

## ASI07 — Insecure Inter-Agent Communication

→ `agentic/insecure-inter-agent-communication.md`

Unauthenticated agent-to-agent messages; spoofable task delegation.

## ASI08 — Cascading Failures

→ `agentic/cascading-failures.md`

One compromised/failing agent triggers system-wide failure or data corruption.

## ASI09 — Human-Agent Trust Exploitation

→ `agentic/human-agent-trust-exploitation.md`

Social engineering via persuasive agent output; fake urgency; bypass human review.

## ASI10 — Rogue Agents

→ `agentic/rogue-agents.md`

Compromised or drifted agents operating outside intended scope persistently.

## Maps to harness core

`AGENT-CORE-PRINCIPLES.md` §13 (AI integration) + all ASI rules above for agentic projects.
