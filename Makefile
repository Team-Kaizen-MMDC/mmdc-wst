# Makefile - helper targets for image conversion, local preview, and testing
.PHONY: help convert-images convert-images-dry server test test-smoke test-e2e test-ui

help:
	@echo "Available targets:"
	@echo "  make convert-images       - Convert images to WebP using scripts/convert-images.sh"
	@echo "  make convert-images-dry   - Dry run conversion (no files written)"
	@echo "  make server               - Start a simple python3 HTTP server on port 8000"
	@echo ""
	@echo "Testing:"
	@echo "  make test                 - Run all Playwright tests"
	@echo "  make test-smoke           - Run smoke tests (all pages, all links)"
	@echo "  make test-e2e             - Run end-to-end navigation tests"
	@echo "  make test-ui              - Run tests in interactive UI mode"
	@echo "  make test-install         - Install Playwright browsers"

convert-images:
	./scripts/convert-images.sh --quality 80

convert-images-dry:
	./scripts/convert-images.sh --quality 80 --dry-run

server:
	python3 -m http.server 8000

test:
	./run-tests.sh

test-smoke:
	./run-tests.sh smoke

test-e2e:
	./run-tests.sh e2e

test-ui:
	./run-tests.sh ui

test-install:
	./run-tests.sh install

