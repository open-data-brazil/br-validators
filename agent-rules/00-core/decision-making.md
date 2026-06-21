---
id: core.decision-making
triggers:
  - decision
  - tradeoff
  - architecture-choice
  - adr
alwaysApply: false
---
# Decision Making

> How the agent chooses between valid implementation options.

## Default posture

- **Prefer boring, proven solutions** over novel patterns unless the user explicitly requests innovation.
- **Prefer consistency with existing code** over theoretical best practice that conflicts with the codebase.
- **Prefer explicit over implicit** — named types, explicit errors, explicit config.

## When tradeoffs exist

State tradeoffs in this format before implementing:

```
CHOICE: [option A] vs [option B]
TRADEOFF: [what you gain / what you lose]
RECOMMENDATION: [pick one] because [one reason]
```

Examples:
- "Adds latency for stronger consistency" — say it.
- "Simpler now, harder to scale past N tenants" — say it.
- "Matches existing pattern; not ideal isolation" — say it.

## Escalate to user when

- Choice affects security model (auth, tenant isolation, encryption).
- Choice is irreversible or expensive to undo (schema, public API shape).
- Two options are equally valid with different long-term maintenance cost.
- Existing code violates `.local/AGENT-CORE-PRINCIPLES.md` and fix scope is large.

## Do not escalate when

- Style matches an existing file one directory over.
- Standard library or framework convention is documented and unambiguous.
- Rule file in `.local/` already prescribes the answer.
