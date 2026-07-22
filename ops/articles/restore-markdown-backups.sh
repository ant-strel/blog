#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EXPORT_DIR="${ARTICLE_EXPORT_DIR:-content/articles}"
RESTORE_SOURCE="${ARTICLE_RESTORE_SOURCE:-git}"
RESTORE_REPO_DIR="${ARTICLE_RESTORE_REPO_DIR:-${ARTICLE_EXPORT_REPO_DIR:-}}"
RESTORE_GIT_URL="${ARTICLE_RESTORE_GIT_URL:-}"
GIT_BRANCH="${ARTICLE_EXPORT_GIT_BRANCH:-main}"
GOOGLE_DRIVE_REMOTE="${ARTICLE_RESTORE_GOOGLE_DRIVE_REMOTE:-${ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE:-}}"

fail() {
  echo "$1" >&2
  exit 1
}

absolute_path() {
  local target="$1"

  if [[ "$target" = /* ]]; then
    printf '%s\n' "$target"
  else
    printf '%s\n' "$ROOT_DIR/$target"
  fi
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required."
}

restore_from_git() {
  [ -n "$RESTORE_REPO_DIR" ] || fail "ARTICLE_RESTORE_REPO_DIR or ARTICLE_EXPORT_REPO_DIR is required for git restore."

  local repo_dir
  repo_dir="$(absolute_path "$RESTORE_REPO_DIR")"

  if [ ! -d "$repo_dir/.git" ]; then
    [ -n "$RESTORE_GIT_URL" ] || fail "Article restore repo '$repo_dir' does not exist. Set ARTICLE_RESTORE_GIT_URL to clone it."
    require_command git
    mkdir -p "$(dirname "$repo_dir")"
    git clone --branch "$GIT_BRANCH" "$RESTORE_GIT_URL" "$repo_dir"
  else
    require_command git
    git -C "$repo_dir" fetch origin "$GIT_BRANCH"
    git -C "$repo_dir" checkout "$GIT_BRANCH"
    git -C "$repo_dir" pull --ff-only origin "$GIT_BRANCH"
  fi

  copy_into_export_dir "$repo_dir"
}

restore_from_drive() {
  [ -n "$GOOGLE_DRIVE_REMOTE" ] || fail "ARTICLE_RESTORE_GOOGLE_DRIVE_REMOTE or ARTICLE_EXPORT_GOOGLE_DRIVE_REMOTE is required for drive restore."
  require_command rclone

  local export_dir
  export_dir="$(absolute_path "$EXPORT_DIR")"
  mkdir -p "$export_dir"
  rclone sync "$GOOGLE_DRIVE_REMOTE" "$export_dir" --create-empty-src-dirs
}

copy_into_export_dir() {
  local source_dir="$1"
  local export_dir
  export_dir="$(absolute_path "$EXPORT_DIR")"

  require_command rsync
  mkdir -p "$export_dir"
  rsync -a --delete --exclude '.git/' "$source_dir"/ "$export_dir"/
}

case "$RESTORE_SOURCE" in
  git)
    restore_from_git
    ;;
  drive | google-drive | gdrive)
    restore_from_drive
    ;;
  none)
    echo "Article markdown restore skipped because ARTICLE_RESTORE_SOURCE=none."
    ;;
  *)
    fail "ARTICLE_RESTORE_SOURCE must be one of: git, drive, none."
    ;;
esac

echo "Article markdown restore complete: $(absolute_path "$EXPORT_DIR")"
