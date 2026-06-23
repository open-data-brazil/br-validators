#!/usr/bin/env bash
# Start Headroom proxy for doc-raiz (context compression for Cursor).
# https://github.com/headroomlabs-ai/headroom — Apache 2.0
#
# Usage: ./scripts/headroom-start.sh
#   or:  pnpm headroom:start

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v headroom >/dev/null 2>&1; then
  echo "Headroom not installed. Run: ./agent-integrations/headroom/setup.sh" >&2
  exit 1
fi

if ss -tln 2>/dev/null | grep -q ':8787 '; then
  echo "Headroom proxy already listening on port 8787."
  echo "OpenAI base URL: http://127.0.0.1:8787/p/doc-raiz/v1"
  echo "Anthropic base URL: http://127.0.0.1:8787/p/doc-raiz"
  exit 0
fi

exec headroom wrap cursor
