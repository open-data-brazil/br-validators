#!/usr/bin/env bash
# Print absolute path to the rules directory for the current project.
# Usage: ./harness/rules-path.sh
#
# Reads harness.config.yaml next to this script (harness/ or agent-harness/).
# Falls back to ./rules or ./agent-rules if config is missing.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG="$SCRIPT_DIR/harness.config.yaml"

if [[ -f "$CONFIG" ]]; then
  python3 - "$CONFIG" "$PROJECT_ROOT" <<'PY'
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("PyYAML required: pip install -r harness/requirements.txt", file=sys.stderr)
    sys.exit(1)

config = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8")) or {}
root = Path(sys.argv[2])
rules_dir = config.get("rules_dir", "rules")
print((root / rules_dir).resolve())
PY
  exit 0
fi

if [[ -d "$PROJECT_ROOT/rules" ]]; then
  echo "$PROJECT_ROOT/rules"
elif [[ -d "$PROJECT_ROOT/agent-rules" ]]; then
  echo "$PROJECT_ROOT/agent-rules"
else
  echo "rules directory not found (no harness.config.yaml and no rules/ or agent-rules/)" >&2
  exit 1
fi
