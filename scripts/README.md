convert-images.sh

This folder contains helper scripts for converting site images to WebP for better performance.

Prerequisites

- macOS: Homebrew installed
- webp tools: `brew install webp` (provides `cwebp`)

Usage

- Convert images (writes .webp files next to originals):
  ./convert-images.sh --quality 80

- Dry run (prints commands without writing files):
  ./convert-images.sh --dry-run

Options

- --quality Q Set WebP quality (default: 80)
- --dry-run Print commands without executing them

Makefile targets

- `make convert-images` Runs the conversion script (quality 80)
- `make convert-images-dry` Dry-run
- `make server` Start a local static server on port 8000

Notes

- This script converts hero images (TokyoDay-1200/800/480) and any files matching _-640._ and _-320._ in `assets/images/aiImages/`.
- You can extend it to generate retina (2x) variants or resize images using `sips` or `imagemagick`.
