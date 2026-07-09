#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EXPORT_DIR="${ARTICLE_EXPORT_DIR:-content/articles}"
EXPORT_REPO_DIR="${ARTICLE_EXPORT_REPO_DIR:-}"
GOOGLE_DRIVE_REMOTE="${ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE:-}"
GIT_REMOTES="${ARTICLE_EXPORT_GIT_REMOTES:-origin}"
GIT_BRANCH="${ARTICLE_EXPORT_GIT_BRANCH:-}"
GIT_COMMIT_MESSAGE="${ARTICLE_EXPORT_COMMIT_MESSAGE:-Sync article markdown export}"

fail() {
  echo "$1" >&2
  exit 1
}

absolute_dir() {
  local dir="$1"

  if [ -d "$dir" ]; then
    (cd "$dir" && pwd -P)
    return
  fi

  if [ -d "$ROOT_DIR/$dir" ]; then
    (cd "$ROOT_DIR/$dir" && pwd -P)
    return
  fi

  return 1
}

SOURCE_DIR="$(absolute_dir "$EXPORT_DIR")" || fail "Export directory '$EXPORT_DIR' does not exist."

if [ -n "$EXPORT_REPO_DIR" ]; then
  REPO_DIR="$(absolute_dir "$EXPORT_REPO_DIR")" || fail "Export repository directory '$EXPORT_REPO_DIR' does not exist."
  USE_EXTERNAL_REPO="true"
else
  REPO_DIR="$ROOT_DIR"
  USE_EXTERNAL_REPO="false"
fi

case "$REPO_DIR" in
  "/" | "${HOME:-}")
    fail "Refusing to use unsafe export repository directory '$REPO_DIR'."
    ;;
esac

git -C "$REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || fail "Directory '$REPO_DIR' is not a git repository."

if [ "$USE_EXTERNAL_REPO" = "true" ] && [ "$SOURCE_DIR" != "$REPO_DIR" ]; then
  command -v rsync >/dev/null 2>&1 \
    || fail "rsync is required to mirror '$SOURCE_DIR' into '$REPO_DIR'."

  rsync -a --delete --exclude '.git/' "$SOURCE_DIR"/ "$REPO_DIR"/
fi

if [ -z "$GIT_BRANCH" ]; then
  GIT_BRANCH="$(git -C "$REPO_DIR" branch --show-current)"
fi

if [ -z "$GIT_BRANCH" ]; then
  GIT_BRANCH="main"
fi

if [ "$USE_EXTERNAL_REPO" = "true" ]; then
  git -C "$REPO_DIR" add -A
  HAS_CHANGES_CMD=(git -C "$REPO_DIR" diff --cached --quiet)
  DRIVE_SYNC_DIR="$REPO_DIR"
else
  git -C "$REPO_DIR" add "$SOURCE_DIR"
  HAS_CHANGES_CMD=(git -C "$REPO_DIR" diff --cached --quiet -- "$SOURCE_DIR")
  DRIVE_SYNC_DIR="$SOURCE_DIR"
fi

if ! "${HAS_CHANGES_CMD[@]}"; then
  git -C "$REPO_DIR" commit -m "$GIT_COMMIT_MESSAGE"
  for remote in $GIT_REMOTES; do
    git -C "$REPO_DIR" push "$remote" "$GIT_BRANCH"
  done
else
  echo "No article export changes to commit."
fi

if [ -n "$GOOGLE_DRIVE_REMOTE" ]; then
  if ! command -v rclone >/dev/null 2>&1; then
    echo "rclone is not installed, cannot sync Google Drive remote '$GOOGLE_DRIVE_REMOTE'." >&2
    exit 1
  fi

  rclone sync "$DRIVE_SYNC_DIR" "$GOOGLE_DRIVE_REMOTE" --exclude '.git/**' --create-empty-src-dirs
else
  echo "ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE is not set, skipping Google Drive sync."
fi
