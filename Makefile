# Makefile - helper targets for image conversion and local preview
.PHONY: help convert-images convert-images-dry run-server

help:
	@echo "Available targets:"
	@echo "  make convert-images       - Convert images to WebP using scripts/convert-images.sh"
	@echo "  make convert-images-dry   - Dry run conversion (no files written)"
	@echo "  make server               - Start a simple python3 HTTP server on port 8000"

convert-images:
	./scripts/convert-images.sh --quality 80

convert-images-dry:
	./scripts/convert-images.sh --quality 80 --dry-run

server:
	python3 -m http.server 8000
