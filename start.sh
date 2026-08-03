#!/usr/bin/env sh
set -eu
PORT="${PORT:-4173}"
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT" --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
  python -m http.server "$PORT" --bind 127.0.0.1
else
  echo "Python 3 is required to run the local static server." >&2
  exit 1
fi
