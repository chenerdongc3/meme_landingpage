#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${OUT:-$ROOT/test-artifacts/threejs}"
PORT="${PORT:-8899}"
SERVER_LOG="${TMPDIR:-/tmp}/me-threejs-http.log"

cd "$ROOT"
node --test tests/test_timeline.js tests/test_product_model.js tests/test_scene_pose.js
node --check app.js
node --check me-scene.js
node --check me-product.js
node --check story-timeline.js

node server.mjs "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in {1..30}; do
  if curl -fsS "http://127.0.0.1:$PORT/index.html" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

curl -fsS "http://127.0.0.1:$PORT/index.html" | grep -q 'data-chapter="p8"'
BASE_URL="http://127.0.0.1:$PORT/index.html" OUTPUT_DIR="$OUT" node capture_scroll.js

printf 'Smoke verification passed.\nArtifacts: %s\n' "$OUT"
