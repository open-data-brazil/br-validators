# Headroom — Apache 2.0 Attribution

This Agent Harness integrates with **[Headroom](https://github.com/headroomlabs-ai/headroom)** as an optional context-compression layer. Headroom is **not** part of this repository's source code.

## Project

| Field | Value |
|-------|-------|
| **Name** | Headroom |
| **Repository** | https://github.com/headroomlabs-ai/headroom |
| **Documentation** | https://headroom-docs.vercel.app/docs/quickstart |
| **License** | [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) |
| **Copyright** | Headroom Labs (see upstream `LICENSE` and `NOTICE`) |

## What Headroom does

Headroom compresses tool outputs, logs, files, and RAG chunks before they reach the LLM — typically **60–95% fewer tokens** with the same answers. It runs **locally** (library, proxy, or Cursor wrap).

## Apache 2.0 notice

```
Copyright 2024-2026 Headroom Labs and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use Headroom except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## This harness relationship

- We **document** and **script** Headroom installation — we do **not** vendor Headroom source code.
- Install via: `pip install "headroom-ai[all]"` (see `integrations/headroom/requirements.txt`).
- Attribution required when distributing or documenting Headroom usage — this file satisfies that requirement.

## Modifications

Files under `integrations/headroom/` in this harness are **our** integration docs and setup scripts (MIT license of this repo). They are not derivative works of Headroom source code.
