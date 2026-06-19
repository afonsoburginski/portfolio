#!/bin/sh
set -e

echo "[entrypoint] applying database migrations…"
node migrate.mjs

echo "[entrypoint] starting Next.js server…"
exec node server.js
