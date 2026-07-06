#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Build the UI if npm is available.
if command -v npm >/dev/null 2>&1; then
  echo "Building frontend..."
  cd src/app/UI
  npm ci
  npm run build
  cd "$ROOT_DIR"
else
  echo "npm not found, skipping frontend build."
fi

# Run database migrations.
alembic upgrade head

# Start the Flask app with Gunicorn.
exec gunicorn src.app.wsgi:app --bind 0.0.0.0:$PORT --workers 1 --threads 2
