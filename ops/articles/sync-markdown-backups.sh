#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EXPORT_DIR="${ARTICLE_EXPORT_DIR:-content/articles}"
GOOGLE_DRIVE_REMOTE="${ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE:-}"
GIT_COMMIT_MESSAGE="${ARTICLE_EXPORT_COMMIT_MESSAGE:-Sync article markdown export}"

cd "$ROOT_DIR"

if [ ! -d "$EXPORT_DIR" ]; then
  echo "Export directory '$EXPORT_DIR' does not exist." >&2
  exit 1
fi

git add "$EXPORT_DIR"
if ! git diff --cached --quiet -- "$EXPORT_DIR"; then
  git commit -m "$GIT_COMMIT_MESSAGE"
  git push
else
  echo "No article export changes to commit."
fi

if [ -n "$GOOGLE_DRIVE_REMOTE" ]; then
  if ! command -v rclone >/dev/null 2>&1; then
    echo "rclone is not installed, cannot sync Google Drive remote '$GOOGLE_DRIVE_REMOTE'." >&2
    exit 1
  fi

  rclone sync "$EXPORT_DIR" "$GOOGLE_DRIVE_REMOTE" --create-empty-src-dirs
else
  echo "ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE is not set, skipping Google Drive sync."
fi
