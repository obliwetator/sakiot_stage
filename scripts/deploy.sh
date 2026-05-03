#!/usr/bin/env bash
set -euo pipefail

TARGET="/var/www/patrykstyla.com"
SRC="./dist/"

if [ ! -d "$SRC" ]; then
  echo "dist/ missing — run 'bun run build' first" >&2
  exit 1
fi

if [ ! -d "$TARGET" ]; then
  echo "Target $TARGET does not exist — refusing to create" >&2
  exit 1
fi

rsync -a --delete --checksum "$SRC" "$TARGET/"
