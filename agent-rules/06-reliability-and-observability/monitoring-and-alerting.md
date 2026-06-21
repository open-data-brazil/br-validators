---
id: rel.monitor
triggers:
  - monitoring
  - alert
  - slo
  - health-check
alwaysApply: false
---
# Monitoring and Alerting

> Alerts tied to user-facing symptoms, not only infra metrics.

## Health checks

- Every deployable service exposes **liveness** and **readiness**.
- Readiness verifies critical dependencies (DB, cache) — with timeout.

## Alerting principles

| Good alert | Bad alert |
|------------|-----------|
| Error rate > X% on checkout API | CPU > 80% (without user impact) |
| p99 latency breach on SLO | Disk 60% full with weeks of headroom |
| Payment webhook failures spike | Single pod restart in k8s |

## SLO mindset

- Define SLIs for critical paths: availability, latency, error rate.
- Page humans on SLO burn — not on every blip.

## Agent action

When adding critical external dependency, add health check probe and metric for failure count — not only try/catch log.
