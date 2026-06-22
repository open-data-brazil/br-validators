# Open source commitment

> **BR Validators is and will remain 100% open source.**
> Core validation logic is MIT-licensed forever — no paid tier, no proprietary fork, no "open core" trap.

---

## License

| Item | Policy |
|------|--------|
| **License** | [MIT](../LICENSE) |
| **SPDX identifier** | `MIT` |
| **Copyright** | BR Validators contributors |
| **Commercial use** | Allowed |
| **Modification** | Allowed |
| **Distribution** | Allowed |
| **Private use** | Allowed |
| **Patent grant** | Not explicit (standard MIT) |
| **Warranty** | None — "AS IS" |

The full license text is in [LICENSE](../LICENSE). A copy must ship with every distribution (npm tarball, fork, bundle).

---

## What "100% open source" means here

### Always free and open (this repository)

- All **core validators** (`cpf`, `cnpj`, `cep`, `placa`, `pix`, etc.)
- All **format/strip** utilities
- All **tests and golden vectors**
- All **documentation** in `docs/`
- All **CI/CD configuration**

### Never in this repo

- Paywalled validation modules
- "Enterprise edition" with stronger algorithms
- Source-available but non-OSI licenses for core code
- Time-limited or seat-licensed validator features

### Optional future packages (still OSS)

Separate npm packages under the same org, **also MIT**:

- `@br-validators/adapters-correios` — HTTP CEP lookup
- `@br-validators/react` — UI helpers

Each must have its own LICENSE (MIT) and live in public GitHub repos. No proprietary dependencies required to use core validators.

---

## Contribution licensing

| Rule | Detail |
|------|--------|
| **Inbound license** | MIT (same as project) |
| **CLA** | Not required |
| **DCO** | Recommended — sign commits with `Signed-off-by` for traceability |
| **Third-party code** | Must be MIT-compatible or public domain; document in PR |
| **Copied algorithms** | Implement from official specs — do not copy GPL source code verbatim |

By submitting a PR, you grant the project permission to include your work under MIT.

---

## Dependencies policy

| Dependency type | Requirement |
|-----------------|-------------|
| **Runtime** | Zero dependencies goal for core (ideal); if added, permissive license only (MIT, BSD, Apache-2.0, ISC) |
| **Dev** | Same; audited in CI |
| **Forbidden** | GPL/AGPL in runtime path (copyleft conflicts with maximal adoption) |

---

## Trademarks

- Project name **"BR Validators"** and repo **br-validators** — use freely for attribution
- Do not imply official endorsement by Receita Federal, Bacen, or government agencies
- npm packages: **`@br-validators/core`** (library) and **`@br-validators/cli`** (terminal) — see [README](../README.md#install-end-users)

---

## Forking

You may fork freely under MIT terms. We encourage:

- Attribution to this project
- Upstream PRs for algorithm fixes (especially security)
- Distinct naming if fork diverges significantly

---

## Governance

| Role | Responsibility |
|------|----------------|
| **Maintainers** | Merge PRs, cut releases, handle [SECURITY.md](../SECURITY.md) |
| **Contributors** | Follow [CONTRIBUTING.md](../CONTRIBUTING.md) |
| **Community** | Issues, discussions, docs improvements |

No corporate board. Decisions driven by correctness (official sources), security, and SemVer contract.

---

## Related documents

| Document | Purpose |
|----------|---------|
| [LICENSE](../LICENSE) | Legal text |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute |
| [SECURITY.md](../SECURITY.md) | Vulnerability reporting |
| [VERSIONING.md](VERSIONING.md) | Release and support policy |
| [VISION.md](VISION.md) | Product mission |

---

## FAQ

**Can I use this in a commercial SaaS?**  
Yes. MIT allows commercial use without payment to us.

**Will a "pro" version with more validators exist?**  
Not from this project. All planned validators ship in open source.

**What if Receita changes CNPJ rules?**  
We patch open source per [VERSIONING.md](VERSIONING.md). Fixes are never paywalled.

**Can I dual-license my fork?**  
Your fork can add licenses only for **your new code**; MIT portions remain under MIT.
