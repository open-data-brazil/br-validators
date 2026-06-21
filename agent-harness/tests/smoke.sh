#!/usr/bin/env bash
# Harness smoke tests — run before release or after changing manifest/scripts.
# Usage: ./harness/tests/smoke.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT="$(cd "$HARNESS_DIR/.." && pwd)"

PASS=0
FAIL=0

pass() {
  echo "PASS: $1"
  PASS=$((PASS + 1))
}

fail() {
  echo "FAIL: $1" >&2
  FAIL=$((FAIL + 1))
}

assert_file() {
  if [[ -f "$1" ]]; then
    pass "file exists: $1"
  else
    fail "missing file: $1"
  fi
}

assert_dir() {
  if [[ -d "$1" ]]; then
    pass "dir exists: $1"
  else
    fail "missing dir: $1"
  fi
}

assert_cmd() {
  if "$@"; then
    pass "command: $*"
  else
    fail "command failed: $*"
  fi
}

assert_output_contains() {
  local desc="$1"
  local needle="$2"
  shift 2
  local output
  output="$("$@" 2>&1)" || {
    fail "$desc (command failed)"
    return
  }
  if echo "$output" | grep -qF "$needle"; then
    pass "$desc (contains: $needle)"
  else
    fail "$desc (expected: $needle)"
    echo "$output" >&2
  fi
}

echo "=== Agent Harness smoke tests ==="
echo "Root: $ROOT"
echo

# --- Required harness files ---
assert_file "$HARNESS_DIR/requirements.txt"
assert_file "$HARNESS_DIR/harness.config.yaml"
assert_file "$HARNESS_DIR/rules-path.sh"
assert_file "$HARNESS_DIR/resolve-rules.sh"
assert_file "$HARNESS_DIR/install.sh"
assert_file "$HARNESS_DIR/bootstrap-project.sh"
assert_file "$HARNESS_DIR/generate-task-rules.sh"
assert_file "$HARNESS_DIR/inject-frontmatter.py"
assert_file "$ROOT/rules/manifest.yaml"
assert_file "$ROOT/AGENTS.md"

# --- rules-path.sh ---
RULES_PATH="$("$HARNESS_DIR/rules-path.sh")"
if [[ "$RULES_PATH" == */rules ]]; then
  pass "rules-path.sh returns .../rules ($RULES_PATH)"
else
  fail "rules-path.sh expected .../rules got: $RULES_PATH"
fi

# --- resolve-rules.sh ---
assert_output_contains \
  "resolve-rules api auth includes authorization.md" \
  "03-security/authorization.md" \
  "$HARNESS_DIR/resolve-rules.sh" api auth

RESOLVE_OUT="$("$HARNESS_DIR/resolve-rules.sh" api auth 2>&1)" || fail "resolve-rules.sh api auth exit non-zero"
if [[ -n "$RESOLVE_OUT" ]]; then
  pass "resolve-rules.sh api auth returns output"
else
  fail "resolve-rules.sh api auth returned empty"
fi

# --- inject-frontmatter.py ---
if python3 "$HARNESS_DIR/inject-frontmatter.py" >/dev/null 2>&1; then
  pass "inject-frontmatter.py exits 0"
else
  fail "inject-frontmatter.py failed"
fi

# --- generate-task-rules.sh ---
TASK_MDC="$ROOT/.cursor/rules/_task-active.mdc"
rm -f "$TASK_MDC"
if "$HARNESS_DIR/generate-task-rules.sh" api auth >/dev/null 2>&1; then
  assert_file "$TASK_MDC"
else
  fail "generate-task-rules.sh api auth failed"
fi
if grep -qF "03-security/authorization.md" "$TASK_MDC"; then
  pass "generate-task-rules.sh includes authorization.md"
else
  fail "generate-task-rules.sh missing authorization.md in output"
fi
RESOLVED_GEN="$("$HARNESS_DIR/resolve-rules.sh" api auth)"
while IFS= read -r rel; do
  [[ -z "$rel" ]] && continue
  if grep -qF "$rel" "$TASK_MDC"; then
    pass "generate-task-rules lists $rel"
  else
    fail "generate-task-rules missing $rel"
  fi
done <<< "$RESOLVED_GEN"
if "$HARNESS_DIR/generate-task-rules.sh" --clean >/dev/null 2>&1 && [[ ! -f "$TASK_MDC" ]]; then
  pass "generate-task-rules.sh --clean removes _task-active.mdc"
else
  fail "generate-task-rules.sh --clean failed"
fi

# --- manifest paths exist ---
if python3 - "$ROOT/rules/manifest.yaml" "$ROOT/rules" <<'PY'
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("PyYAML not installed — pip install -r harness/requirements.txt", file=sys.stderr)
    sys.exit(1)

manifest = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8"))
rules_dir = Path(sys.argv[2])
missing = []

for path in manifest.get("always_apply", []):
    if not (rules_dir / path).is_file():
        missing.append(path)

for entry in manifest.get("rules", []):
    if not entry or not entry.get("path"):
        continue
    path = entry["path"]
    if not (rules_dir / path).is_file():
        missing.append(path)

if missing:
    for p in missing:
        print(f"missing: {p}", file=sys.stderr)
    sys.exit(1)

print(f"ok: {len(manifest.get('always_apply', []))} always_apply + {len(manifest.get('rules', []))} rules")
PY
then
  pass "all manifest.yaml paths exist on disk"
else
  fail "manifest paths missing on disk"
fi

# --- bootstrap dry run (temp dir) ---
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
if "$HARNESS_DIR/bootstrap-project.sh" "$TMP" >/dev/null 2>&1; then
  assert_file "$TMP/docs/GLOSSARY.md"
  assert_dir "$TMP/agent-rules"
  assert_file "$TMP/agent-harness/harness.config.yaml"
else
  fail "bootstrap-project.sh failed"
fi

echo
echo "=== Results: $PASS passed, $FAIL failed ==="

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

exit 0
