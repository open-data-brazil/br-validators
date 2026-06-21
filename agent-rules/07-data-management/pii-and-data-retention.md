---
id: data.pii
triggers:
  - pii
  - gdpr
  - lgpd
  - retention
  - privacy
alwaysApply: false
---
# PII and Data Retention

> Classify PII; define retention and deletion per data type.

## Classification

Maintain registry:

| Field | Classification | Mask in logs | Encrypt at rest |
|-------|----------------|--------------|-----------------|
| email | PII | yes | per policy |
| governmentId | sensitive PII | yes | yes |

## Retention

- Define TTL per data type and legal basis (LGPD/GDPR).
- Deletion = soft-delete flag + hard purge job OR crypto-shred — document which.
- Export/portability endpoints for user data where regulation requires.

## Agent action

When adding field that identifies a person, add to PII registry in docs and apply masking in log/response layers.
