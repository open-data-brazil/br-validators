#!/usr/bin/env bash
# Bootstrap a new AI-assisted project with docs templates + Agent Harness.
#
# Usage:
#   ./harness/bootstrap-project.sh /path/to/new-project
#   ./harness/bootstrap-project.sh /path/to/new-project --symlink
#
# Creates:
#   docs/GLOSSARY.md
#   docs/API-CONTRACT.md
#   docs/USE-CASE-EXAMPLE.md
#   docs/NEW-PROJECT-CHECKLIST.md
#   docs/use-cases/          (empty, for UC files)
#   agent-rules/, agent-harness/, .cursor/rules/  (via install.sh)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATES="$HARNESS_ROOT/templates"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <target-project-path> [--symlink]" >&2
  exit 1
fi

TARGET="$(mkdir -p "$1" && cd "$1" && pwd)"
INSTALL_ARGS=()

shift || true
for arg in "$@"; do
  case "$arg" in
    --symlink) INSTALL_ARGS+=(--symlink) ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

if [[ ! -d "$TEMPLATES" ]]; then
  echo "templates not found: $TEMPLATES" >&2
  exit 1
fi

DOCS="$TARGET/docs"
USE_CASES="$DOCS/use-cases"
mkdir -p "$USE_CASES"

copy_template() {
  local src_name="$1"
  local dest_name="$2"
  local src="$TEMPLATES/$src_name"
  local dest="$DOCS/$dest_name"
  if [[ ! -f "$src" ]]; then
    echo "missing template: $src" >&2
    exit 1
  fi
  cp "$src" "$dest"
  echo "CREATE $dest"
}

copy_template "GLOSSARY.template.md" "GLOSSARY.md"
copy_template "API-CONTRACT.template.md" "API-CONTRACT.md"
copy_template "USE-CASE.template.md" "USE-CASE-EXAMPLE.md"
cp "$TEMPLATES/NEW-PROJECT-CHECKLIST.md" "$DOCS/NEW-PROJECT-CHECKLIST.md"
echo "CREATE $DOCS/NEW-PROJECT-CHECKLIST.md"

if [[ -f "$HARNESS_ROOT/AGENTS.md" ]] && [[ ! -f "$TARGET/AGENTS.md" ]]; then
  cp "$HARNESS_ROOT/AGENTS.md" "$TARGET/AGENTS.md"
  echo "CREATE $TARGET/AGENTS.md"
fi

"$SCRIPT_DIR/install.sh" "$TARGET" "${INSTALL_ARGS[@]}"

cat <<EOF

Project bootstrapped: $TARGET

  docs/GLOSSARY.md
  docs/API-CONTRACT.md
  docs/USE-CASE-EXAMPLE.md
  docs/NEW-PROJECT-CHECKLIST.md
  docs/use-cases/

Harness:
  agent-rules/
  agent-harness/
  .cursor/rules/

Next steps:
  1. Fill docs/NEW-PROJECT-CHECKLIST.md before coding
  2. Read AGENTS.md in agent sessions
  3. ./agent-harness/resolve-rules.sh <task keywords>

EOF
