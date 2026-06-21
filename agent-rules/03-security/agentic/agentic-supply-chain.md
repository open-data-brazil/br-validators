---
id: sec.agentic.asi04
triggers:
  - agentic
  - skill
  - rule-pack
  - asi04
alwaysApply: false
---
# Agentic Supply Chain Vulnerabilities (ASI04)

> OWASP Agentic 2026 — compromised third-party agents, MCP servers, prompts, skills.

## Agent one-liners

- Pin MCP server versions; verify publisher before install.
- Never auto-install skills/rules from unverified URLs.
- Review third-party prompt templates and `.mdc` rules like code dependencies.
- Hash-verify harness/rule updates in CI.

## MUST

- Allow-list approved MCP servers and agent extensions per org.
- Scan skill/rule packages for exfiltration patterns before enable.
- Submodule/subtree harness from trusted repo only with commit SHA pin.

## MUST NOT

- `npx` / `curl` latest agent skill from unknown author into production workflow.
- Blindly merge community `.cursor/rules` without review.

## Maps to

- `../supply-chain-security.md`, `../../09-ai-agent-specific/anti-hallucination.md`

## Agent action

Before adding MCP server or external skill, document source, version, and reviewer in PR.
