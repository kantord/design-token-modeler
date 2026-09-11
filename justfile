# List all available recipes
default:
    @just --list

# Full first-time setup: build wasm, then install JS deps
setup: build-wasm
    pnpm install

# --- Rust ---------------------------------------------------------------

# Run the native CLI
run:
    cargo run -p hello-cli

# Run all Rust tests
test:
    cargo test --workspace

# Build the wasm-bindgen package consumed by apps/web
build-wasm:
    wasm-pack build crates/hello-wasm --target web --out-dir pkg

# --- Web ------------------------------------------------------------------

# Start the Vite dev server (always ensures wasm + deps are fresh first)
dev: setup
    pnpm --filter web run dev

# Build the static multi-page site into apps/web/dist
build-web: setup
    pnpm --filter web run build

# Preview the built static site
preview: build-web
    pnpm --filter web run preview

# --- Everything -------------------------------------------------------------

# Build and test everything (Rust + wasm + static site)
build: test build-web

# Remove all build artifacts
clean:
    cargo clean
    rm -rf crates/hello-wasm/pkg apps/web/dist apps/web/node_modules node_modules
