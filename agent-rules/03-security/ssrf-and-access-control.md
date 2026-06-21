---
id: sec.ssrf
triggers:
  - ssrf
  - webhook
  - outbound
  - url-fetch
alwaysApply: false
---
# SSRF and Access Control

> OWASP 2025 — SSRF folded into Broken Access Control; server-side outbound requests need allow-lists.

## Risk

User-controlled URLs cause the server to request internal resources (metadata services, internal APIs, file://).

## Rules

- **NEVER** pass raw user URL directly to server-side HTTP client without validation.
- **Allow-list** outbound hostnames/schemes (https only in production).
- Block private IP ranges, link-local, metadata endpoints (169.254.169.254).
- Webhooks: validate URL at registration; re-validate on dispatch if URL can change.

## DNS rebinding

- Resolve hostname and verify IP before request where high risk.
- Short timeout on outbound requests.

## Agent action

When implementing "fetch URL from user input" or webhook callback, implement allow-list validator first — default deny.
