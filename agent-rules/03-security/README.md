# Security Rules Index

> **OWASP Top 10:2025-aligned security rules** (current web application standard through 2026).
> **OWASP Top 10 for Agentic Applications:2026** (ASI01–ASI10) for autonomous AI agents.

Load on demand via `./harness/resolve-rules.sh security owasp agentic`.

---

## Standards covered

| Standard | Scope | Index file |
|----------|-------|------------|
| OWASP Top 10:2025 | Web/API applications | [OWASP-TOP10-2025.md](./OWASP-TOP10-2025.md) |
| OWASP Agentic Top 10:2026 | Autonomous AI agents, tools, multi-agent | [OWASP-AGENTIC-2026.md](./OWASP-AGENTIC-2026.md) |

Official references:
- https://owasp.org/Top10/2025/
- https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

---

## OWASP Top 10:2025 → rule files

| ID | Category | Rule file(s) |
|----|----------|--------------|
| A01 | Broken Access Control (BOLA, BFLA, SSRF) | `authorization.md`, `ssrf-and-access-control.md`, `least-privilege.md` |
| A02 | Security Misconfiguration | `security-misconfiguration.md` |
| A03 | Software Supply Chain Failures | `supply-chain-security.md` |
| A04 | Cryptographic Failures | `encryption.md`, `secrets-and-credentials.md` |
| A05 | Injection | `injection-prevention.md`, `input-validation.md` |
| A06 | Insecure Design | `insecure-design.md` |
| A07 | Authentication Failures | `authentication.md` |
| A08 | Software or Data Integrity Failures | `software-data-integrity.md` |
| A09 | Security Logging and Alerting Failures | `audit-logging.md`, `06-reliability-and-observability/monitoring-and-alerting.md` |
| A10 | Mishandling of Exceptional Conditions | `../01-clean-code/error-handling.md`, `../06-reliability-and-observability/exception-handling-discipline.md` |

Supporting rules (cross-cutting): `mass-assignment-and-data-exposure.md`, `rate-limiting-and-resource-control.md`.

---

## OWASP Agentic Top 10:2026 → rule files

| ID | Category | Rule file |
|----|----------|-----------|
| ASI01 | Agent Goal Hijack | `agentic/agent-goal-hijack.md` |
| ASI02 | Tool Misuse and Exploitation | `agentic/tool-misuse.md` |
| ASI03 | Identity and Privilege Abuse | `agentic/identity-privilege-abuse.md` |
| ASI04 | Agentic Supply Chain Vulnerabilities | `agentic/agentic-supply-chain.md` |
| ASI05 | Unexpected Code Execution | `agentic/unexpected-code-execution.md` |
| ASI06 | Memory and Context Poisoning | `agentic/memory-context-poisoning.md` |
| ASI07 | Insecure Inter-Agent Communication | `agentic/insecure-inter-agent-communication.md` |
| ASI08 | Cascading Failures | `agentic/cascading-failures.md` |
| ASI09 | Human-Agent Trust Exploitation | `agentic/human-agent-trust-exploitation.md` |
| ASI10 | Rogue Agents | `agentic/rogue-agents.md` |

---

## Resolve by task

```bash
./harness/resolve-rules.sh owasp security          # web app security bundle
./harness/resolve-rules.sh agentic tool hijack     # agentic AI security
./harness/resolve-rules.sh authz bola injection  # access + injection focus
```

## Agent MUST

- Map every security-sensitive change to at least one OWASP A** or ASI** ID.
- Load `README.md` (this file) first on security reviews — then load specific rule files only.
