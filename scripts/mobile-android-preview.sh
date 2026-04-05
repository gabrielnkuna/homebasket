#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

"$SCRIPT_DIR/mobile-preflight.sh"

cd "$REPO_ROOT"
echo "Starting Android preview build..."
npx eas-cli build --platform android --profile preview
