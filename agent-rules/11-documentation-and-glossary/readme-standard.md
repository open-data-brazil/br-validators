---
id: docs.readme
triggers:
  - readme
  - documentation
alwaysApply: false
---
# README Standard

> Every project/module README answers four questions.

## Required sections

### 1. What it does

One paragraph — business capability, not tech stack laundry list.

### 2. How to run it

```bash
# Prerequisites
# Install
# Start dev
# Verify health
```

Copy-pasteable commands that work.

### 3. How to test it

```bash
# Unit
# Integration
# Lint
```

Include coverage command if applicable.

### 4. Key constraints

- Architecture layers enforced
- Required env vars (link to `.env.example`)
- Security notes (auth model, tenant isolation)
- Links to glossary, ADRs, API spec

## Module READMEs

Submodules get shorter README with same four sections scoped to module.

## Language

100% English.

## Agent action

When creating new package/service folder, add README skeleton in same PR as scaffold — not empty folder.
