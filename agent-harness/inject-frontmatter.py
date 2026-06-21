#!/usr/bin/env python3
"""Inject YAML frontmatter into rules/*.md from rules/manifest.yaml."""

from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("PyYAML required: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
RULES_DIR = ROOT / "rules"
MANIFEST = RULES_DIR / "manifest.yaml"
FRONTMATTER_RE = re.compile(r"^---\n.*?\n---\n", re.DOTALL)


def build_frontmatter(entry: dict) -> str:
    lines = [
        "---",
        f"id: {entry['id']}",
        "triggers:",
    ]
    for t in entry["triggers"]:
        lines.append(f"  - {t}")
    lines.append("alwaysApply: false")
    lines.append("---")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    data = yaml.safe_load(MANIFEST.read_text(encoding="utf-8"))
    updated = 0

    for entry in data["rules"]:
        path = RULES_DIR / entry["path"]
        if not path.exists():
            print(f"SKIP missing: {entry['path']}", file=sys.stderr)
            continue

        body = path.read_text(encoding="utf-8")
        if body.startswith("---"):
            body = FRONTMATTER_RE.sub("", body, count=1)

        path.write_text(build_frontmatter(entry) + body, encoding="utf-8")
        updated += 1

    print(f"Updated frontmatter on {updated} rule files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
