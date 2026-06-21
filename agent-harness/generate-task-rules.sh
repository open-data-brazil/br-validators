#!/usr/bin/env bash
# Generate a temporary Cursor rule file from task keywords (manifest triggers).
#
# Usage:
#   ./harness/generate-task-rules.sh api auth
#   ./harness/generate-task-rules.sh api endpoint -o .cursor/rules/_task-active.mdc
#   ./harness/generate-task-rules.sh --clean
#
# Writes .cursor/rules/_task-active.mdc by default (alwaysApply: false).
# DELETE the file when the task is complete.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_OUT="$PROJECT_ROOT/.cursor/rules/_task-active.mdc"
OUTPUT="$DEFAULT_OUT"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <keywords...> [-o output.mdc]" >&2
  echo "       $0 --clean" >&2
  exit 1
fi

if [[ "${1:-}" == "--clean" ]]; then
  if [[ -f "$DEFAULT_OUT" ]]; then
    rm "$DEFAULT_OUT"
    echo "Removed $DEFAULT_OUT"
  else
    echo "Nothing to clean: $DEFAULT_OUT not found"
  fi
  exit 0
fi

KEYWORDS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    -o|--output)
      OUTPUT="$2"
      shift 2
      ;;
    *)
      KEYWORDS+=("$1")
      shift
      ;;
  esac
done

if [[ ${#KEYWORDS[@]} -eq 0 ]]; then
  echo "Error: provide at least one keyword" >&2
  exit 1
fi

RULES_DIR="$("$SCRIPT_DIR/rules-path.sh")"
RESOLVED="$("$SCRIPT_DIR/resolve-rules.sh" "${KEYWORDS[@]}")"

if [[ -z "$RESOLVED" ]]; then
  echo "Error: resolve-rules.sh returned no files" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"

KEYWORDS_STR="${KEYWORDS[*]}"

{
  echo "---"
  echo "description: Active task rules (${KEYWORDS_STR}) — delete when task complete"
  echo "alwaysApply: false"
  echo "---"
  echo
  echo "# Task-scoped rules (generated)"
  echo
  echo "> **Cleanup:** remove this file when done: \`rm .cursor/rules/_task-active.mdc\`"
  echo "> Or run: \`./harness/generate-task-rules.sh --clean\`"
  echo
  echo "**Keywords:** ${KEYWORDS_STR}"
  echo
  echo "**Rules directory:** \`${RULES_DIR}\`"
  echo
  echo "## Load these rule files"
  echo
  while IFS= read -r rel; do
    [[ -z "$rel" ]] && continue
    full="$RULES_DIR/$rel"
    echo "- \`${full}\`"
  done <<< "$RESOLVED"
  echo
  echo "## Agent MUST"
  echo
  echo "- Read each file above before implementing."
  echo "- Do not load the entire rules tree — only listed files + base alwaysApply rules."
  echo "- Remove \`_task-active.mdc\` when the task is complete."
} > "$OUTPUT"

echo "Wrote $OUTPUT"
echo "Resolved ${KEYWORDS[*]}:"
echo "$RESOLVED" | sed 's/^/  /'
