#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HARNESS_DIR="$ROOT_DIR/automation/harness"

if [[ -f "$HARNESS_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  source "$HARNESS_DIR/.env"
fi

: "${REPO_FULL_NAME:?REPO_FULL_NAME is required}"
: "${REPO_DIR:=$ROOT_DIR}"

python3 "$HARNESS_DIR/github_issue_harness.py"
