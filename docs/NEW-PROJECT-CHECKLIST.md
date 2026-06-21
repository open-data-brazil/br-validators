# New Project Checklist

> Complete **before writing the first line of code**.
> Status updated: documentation phase complete — ready for scaffold.

---

## Architecture and domain

- [x] **Layers defined** — core / strip / format / adapters — see [ARCHITECTURE.md](ARCHITECTURE.md)
- [x] **Value Objects** — canonical string values with fixed length per type — see [GLOSSARY.md](GLOSSARY.md)
- [x] **Business rules** — GIVEN/WHEN/THEN in [VALIDATION-RULES.md](VALIDATION-RULES.md)
- [ ] **State machines** — N/A for validation library (no entity lifecycle)
- [ ] **Access roles** — N/A (open-source lib, no auth)
- [ ] **Domain events** — N/A (pure functions)
- [x] **Use cases** — UC-001 … UC-005 in [use-cases/](use-cases/)
- [x] **API contract** — [LIBRARY-API.md](LIBRARY-API.md)
- [x] **Glossary** — [GLOSSARY.md](GLOSSARY.md)

---

## Security (OWASP)

- [x] **SECURITY.md** — private vulnerability reporting
- [x] **SECURITY-PRACTICES.md** — maintainer and integrator guidance
- [ ] **OWASP Top 10:2025** — npm supply chain audit when scaffold exists
- [ ] **Agentic 2026** — harness rules apply to agent sessions building the lib

---

## Governance and releases

- [x] **LICENSE** — MIT
- [x] **OPEN-SOURCE.md** — 100% open source commitment
- [x] **VERSIONING.md** — SemVer and release process
- [x] **CONTRIBUTING.md** — contribution + security contribution
- [x] **CODE_OF_CONDUCT.md**
- [x] **CHANGELOG.md** — Keep a Changelog format
- [x] **GOVERNANCE.md** — document index

---

## Official sources

- [x] **Source catalog** — [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md)
- [x] **CNPJ alphanumeric deep dive** — [CNPJ-ALPHANUMERIC.md](CNPJ-ALPHANUMERIC.md)
- [ ] **PIS/PASEP primary source** — research pending
- [ ] **IE per-state sources** — collect before Phase 4

---

## Agent harness

- [x] **Harness installed** — `agent-rules/`, `agent-harness/`, `.cursor/rules/`
- [x] **AGENTS.md** — project entry point

---

## Implementation readiness

- [x] Toolchain chosen — **TypeScript 5+**, pnpm, Vitest, Next.js, Vercel, Commander CLI
- [ ] Monorepo scaffold (`packages/br-validators`, `apps/cli`, `apps/playground`)
- [ ] Golden test vectors from RFB PDF Q14
- [ ] CI pipeline (library + CLI + playground build)

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Product / domain | | |
| Tech lead | | |

When implementation checklist items are checked, coding may begin.
