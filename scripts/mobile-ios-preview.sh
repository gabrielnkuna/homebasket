#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

"$SCRIPT_DIR/mobile-preflight.sh"

cd "$REPO_ROOT"
echo "Starting iPhone preview build..."
npx eas-cli build --platform ios --profile preview
