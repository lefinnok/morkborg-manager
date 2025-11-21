.PHONY: build serve clean help

help:
	@echo "Mörk Borg Manager - Makefile Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build    - Build the production static site"
	@echo "  make serve    - Serve the static site with Python (requires build first)"
	@echo "  make dev      - Run development server with hot reload"
	@echo "  make clean    - Remove build artifacts"
	@echo "  make install  - Install dependencies"

install:
	npm install

build:
	npm run build

dev:
	npm run dev

serve: build
	@echo "Starting Python HTTP server on http://localhost:8000"
	@echo "Press Ctrl+C to stop"
	cd dist && python3 -m http.server 8000

clean:
	rm -rf dist node_modules
