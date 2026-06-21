---
id: sec.agentic.asi07
triggers:
  - agentic
  - multi-agent
  - inter-agent
  - asi07
alwaysApply: false
---
# Insecure Inter-Agent Communication (ASI07)

> OWASP Agentic 2026 — spoofable or unauthenticated agent-to-agent messages.

## Agent one-liners

- Authenticate and sign inter-agent messages (mTLS, JWT, HMAC).
- Allow-list which agents may delegate to which.
- Never trust task payload from another agent without verification.
- Include correlation ID and sender identity on every delegation.

## MUST

- Encrypt agent bus traffic in transit.
- Validate schema and signature before acting on delegated task.
- Timeout and cancel orphaned sub-agent tasks.

## MUST NOT

- Open unauthenticated webhook endpoint for "agent callbacks".
- Pass raw user input through agent chain without re-validation at each hop.

## Agent action

Multi-agent design → ADR documenting auth model between agents before implementation.
