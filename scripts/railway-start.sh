#!/bin/sh
set -eu

# Railway volume (e.g. /data) — persist uploads across deploys
DATA_ROOT="${UPLOAD_ROOT:-${RAILWAY_VOLUME_MOUNT_PATH:-}}"

if [ -n "$DATA_ROOT" ]; then
  echo "Using upload volume at: $DATA_ROOT"
  mkdir -p "$DATA_ROOT/uploads" "$DATA_ROOT/magazine" "$DATA_ROOT/gallery" "$DATA_ROOT/hero"

  for dir in uploads magazine gallery hero; do
    target="public/$dir"
    # Seed bundled public assets into the volume once (non-clobber)
    if [ -d "$target" ] && [ ! -L "$target" ]; then
      echo "Seeding $target -> $DATA_ROOT/$dir"
      cp -rn "$target/." "$DATA_ROOT/$dir/" 2>/dev/null || true
      rm -rf "$target"
    elif [ -L "$target" ]; then
      rm -f "$target"
    fi
    ln -sfn "$DATA_ROOT/$dir" "$target"
  done
fi

echo "Syncing database schema..."
npx prisma db push --skip-generate

echo "Starting Next.js..."
exec npx next start -p "${PORT:-3700}"
