#!/usr/bin/env bash
# Install and configure Headroom for Cursor (optional integration).
# https://github.com/headroomlabs-ai/headroom — Apache 2.0
#
# Usage:
#   ./integrations/headroom/setup.sh              # from harness repo
#   ./agent-integrations/headroom/setup.sh        # from installed project
#   ./agent-integrations/headroom/setup.sh --wrap # print Cursor wrap config

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DO_WRAP=false

for arg in "$@"; do
  case "$arg" in
    --wrap) DO_WRAP=true ;;
    -h|--help)
      echo "Usage: $0 [--wrap]"
      echo "  --wrap  Run 'headroom wrap cursor' and show paste instructions"
      exit 0
      ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 required (Headroom needs Python 3.10+)" >&2
  exit 1
fi

PY_VERSION="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
PY_MAJOR="${PY_VERSION%%.*}"
PY_MINOR="${PY_VERSION#*.}"
if [[ "$PY_MAJOR" -lt 3 ]] || [[ "$PY_MAJOR" -eq 3 && "$PY_MINOR" -lt 10 ]]; then
  echo "Error: Headroom requires Python 3.10+ (found $PY_VERSION)" >&2
  exit 1
fi

echo "=== Headroom setup (Apache 2.0) ==="
echo "Source: https://github.com/headroomlabs-ai/headroom"
echo

pip install -q -r "$SCRIPT_DIR/requirements.txt"

if ! command -v headroom >/dev/null 2>&1; then
  echo "Error: headroom CLI not found after install" >&2
  exit 1
fi

headroom --version 2>/dev/null || true

echo
echo "Headroom installed."
echo

if [[ "$DO_WRAP" == true ]]; then
  echo "=== Cursor configuration ==="
  echo
  echo "This starts the Headroom proxy (blocking). Keep this terminal open."
  echo "Configure Cursor: Settings > Models > OpenAI API Key > Advanced > Override Base URL"
  echo "Use: http://127.0.0.1:8787/v1  (or port from output below)"
  echo
  exec headroom wrap cursor
else
  cat <<'EOF'
Next steps:

  1. Cursor wrap (recommended — paste config once):
     ./agent-integrations/headroom/setup.sh --wrap
     # or: headroom wrap cursor

  2. Proxy mode (alternative):
     headroom proxy --port 8787
     # Point Cursor to http://localhost:8787

  3. Verify savings:
     headroom perf

See integrations/headroom/README.md for full docs.
EOF
fi
