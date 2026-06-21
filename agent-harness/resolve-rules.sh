#!/usr/bin/env bash
# Resolve which rule files to load for a task based on keyword triggers.
# Usage: ./harness/resolve-rules.sh api endpoint auth
# Output: one path per line (relative to rules/)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RULES_DIR="$("$SCRIPT_DIR/rules-path.sh")"
MANIFEST="$RULES_DIR/manifest.yaml"

if [[ ! -f "$MANIFEST" ]]; then
  echo "manifest not found: $MANIFEST" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 required" >&2
  exit 1
fi

python3 - "$MANIFEST" "$RULES_DIR" "$@" <<'PY'
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("PyYAML required: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

manifest_path = Path(sys.argv[1])
rules_dir = Path(sys.argv[2])
keywords = [k.lower().replace("_", "-") for k in sys.argv[3:]]

data = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
selected: list[str] = []
seen: set[str] = set()

def add(path: str) -> None:
    if path not in seen:
        seen.add(path)
        selected.append(path)

for path in data.get("always_apply", []):
    add(path)

if not keywords:
    for entry in data.get("rules", []):
        add(entry["path"])
else:
    for entry in data.get("rules", []):
        if not entry or not entry.get("path"):
            continue
        triggers = [str(t).lower() for t in entry.get("triggers") or [] if t]
        if any(kw == t or kw in t or t in kw for kw in keywords for t in triggers):
            add(entry["path"])

for path in selected:
    full = rules_dir / path
    if full.exists():
        print(path)
PY
