#!/usr/bin/env bash
# scripts/convert-images.sh
# Recursively convert site images under assets/images to WebP and generate
# resized variants. Preserves directory structure and writes WebP files
# next to the originals. Uses cwebp for conversion and resizing.
#
# Usage:
#   ./scripts/convert-images.sh [--quality Q] [--dry-run]
# Options:
#   --quality Q   Set cwebp quality (default: 80)
#   --dry-run     Print commands without executing them
#   -h, --help    Show this help text

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGES_DIR="$REPO_ROOT/assets/images"
QUALITY=80
DRY_RUN=0

# Sizes to produce as resized webp variants (widths in px). The script will
# always produce a same-name .webp beside the original; these sizes produce
# additional -<width>.webp files.
SIZES=(1200 800 480)
THUMBS=(640 320)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --quality)
      QUALITY="$2"; shift 2;;
    --dry-run)
      DRY_RUN=1; shift;;
    -h|--help)
      sed -n '1,240p' "$0"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

# Locate cwebp, but allow --dry-run to proceed even if it's not installed.
CWEBP_BIN="$(command -v cwebp || true)"
if [[ -z "$CWEBP_BIN" && $DRY_RUN -eq 0 ]]; then
  echo "Error: cwebp not found in PATH. Install webp tools (Homebrew: brew install webp)" >&2
  exit 2
fi

echo "Scanning images under: $IMAGES_DIR"

convert_to_webp() {
  local src="$1"
  local dest="${src%.*}.webp"
  # If destination exists and is newer than source, skip conversion
  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    if [[ $DRY_RUN -eq 1 ]]; then
      echo "DRY: SKIP up-to-date: $dest"
    else
      echo "SKIP up-to-date: $dest"
    fi
    return 0
  fi
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "DRY: $CWEBP_BIN -q $QUALITY \"$src\" -o \"$dest\""
  else
    echo "Converting: $src -> $dest"
    "$CWEBP_BIN" -q "$QUALITY" "$src" -o "$dest"
  fi
}

convert_resized() {
  local src="$1"
  local width="$2"
  local dest="${src%.*}-$width.webp"
  # If destination exists and is newer than source, skip conversion
  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    if [[ $DRY_RUN -eq 1 ]]; then
      echo "DRY: SKIP up-to-date: $dest"
    else
      echo "SKIP up-to-date: $dest"
    fi
    return 0
  fi
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "DRY: $CWEBP_BIN -q $QUALITY -resize $width 0 \"$src\" -o \"$dest\""
  else
    echo "Resizing: $src -> $dest (width=${width})"
    "$CWEBP_BIN" -q "$QUALITY" -resize "$width" 0 "$src" -o "$dest"
  fi
}

# Find jpg/jpeg/png files recursively and process them
shopt -s nullglob
while IFS= read -r -d '' src; do
  # Skip files that are not source formats (we target jpg/jpeg/png)
  lcsrc="$(printf '%s' "$src" | tr '[:upper:]' '[:lower:]')"
  case "$lcsrc" in
    *.jpg|*.jpeg|*.png)
      ;;
    *)
      continue
      ;;
  esac

  # Convert the original image to webp
  convert_to_webp "$src"

  # Create resized variants (main sizes)
  for w in "${SIZES[@]}"; do
    convert_resized "$src" "$w"
  done

  # Create thumbnail variants
  for w in "${THUMBS[@]}"; do
    convert_resized "$src" "$w"
  done

done < <(find "$IMAGES_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)

echo "Done. WebP variants generated under: $IMAGES_DIR"
