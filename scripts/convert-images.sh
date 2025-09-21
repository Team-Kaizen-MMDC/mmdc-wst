#!/usr/bin/env bash
# scripts/convert-images.sh
# Convert site images to WebP and optionally resize for responsive variants.
# Usage:
#   ./convert-images.sh [--quality Q] [--dry-run]
# Examples:
#   ./convert-images.sh --quality 80
#   ./convert-images.sh --dry-run

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGES_DIR="$REPO_ROOT/assets/images/aiImages"
QUALITY=80
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --quality)
      QUALITY="$2"; shift 2;;
    --dry-run)
      DRY_RUN=1; shift;;
    -h|--help)
      sed -n '1,120p' "$0"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

CWEBP_BIN="$(command -v cwebp || true)"
if [[ -z "$CWEBP_BIN" ]]; then
  echo "Error: cwebp not found in PATH. Install webp tools (Homebrew: brew install webp)" >&2
  exit 2
fi

# Convert function
convert_file() {
  local src="$1"
  local dest="${src%.*}.webp"
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "DRY: $CWEBP_BIN -q $QUALITY \"$src\" -o \"$dest\""
  else
    echo "Converting $src -> $dest"
    "$CWEBP_BIN" -q "$QUALITY" "$src" -o "$dest"
  fi
}

# Convert hero sizes
for s in 1200 800 480; do
  src="$IMAGES_DIR/TokyoDay-${s}.jpg"
  [[ -f "$src" ]] && convert_file "$src"
done

# Convert thumbnail variants (pattern *-320.*, *-640.*)
shopt -s nullglob
for f in "$IMAGES_DIR"/*-640.* "$IMAGES_DIR"/*-320.*; do
  convert_file "$f"
done

echo "Done. WebP files written to: $IMAGES_DIR"
