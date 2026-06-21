---
id: sec.agentic.asi02
triggers:
  - agentic
  - tool-misuse
  - mcp
  - asi02
alwaysApply: false
---
# Tool Misuse and Exploitation (ASI02)

> OWASP Agentic 2026 — legitimate tools used for unintended harmful actions.

## Agent one-liners

- Allow-list tools per task — not full toolbox every turn.
- Shell/git/file tools: scope to project directory; no recursive delete without confirm.
- Never pass user input directly to shell, SQL, or HTTP tool parameters unsanitized.
- Read-only tools default; write/exec tools require explicit task need.

## MUST

- Tool permissions minimal for current step (least privilege).
- Validate tool arguments against schema before execution.
- Block tools that exfiltrate secrets (env dump, `.env` read) unless task requires.
- Separate read tools from write tools in agent policy.

## MUST NOT

- Run `rm -rf`, force push, or prod deploy via agent without human gate.
- Chain tools to bypass auth (fetch token → call admin API).

## Agent action

Before invoking destructive or network tool, state tool name + args + why — match task scope.
