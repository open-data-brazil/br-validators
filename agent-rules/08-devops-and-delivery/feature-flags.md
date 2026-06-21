---
id: devops.flags
triggers:
  - feature-flag
  - toggle
  - rollout
alwaysApply: false
---
# Feature Flags

> Risky changes behind flags — not long-lived feature branches.

## Use flags for

- Incomplete features shipping dark
- High-risk migrations with kill switch
- A/B experiments with measurement

## Rules

- Flag default **off** in production until explicitly enabled.
- Remove flag + dead code within defined TTL after full rollout (ticket tracked).
- Flags evaluated server-side for security-sensitive behavior.

## Anti-pattern

- Month-long feature branch diverged from main — merge frequently, hide behind flag instead.

## Agent action

If feature not ready for all users, implement behind flag in same PR as core logic — document flag name in README/runbook.
