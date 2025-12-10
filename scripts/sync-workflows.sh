#!/bin/bash

# Sync GitHub Actions workflows from shogi-log to the current project
#
# Usage:
#   - As submodule: Run from project root (e.g., ./app/scripts/sync-workflows.sh)
#   - As npm package: Run via pnpm exec sync-workflows

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source directory (workflows in the package/submodule)
SOURCE_DIR="$SCRIPT_DIR/../.github/workflows"

# Target directory (current project's .github/workflows)
# When run as submodule from project root, $(pwd) is the project root
# When run as npm package, $(pwd) is also the project root
TARGET_DIR="$(pwd)/.github/workflows"

echo "📋 Syncing GitHub Actions workflows..."
echo "  From: $SOURCE_DIR"
echo "  To:   $TARGET_DIR"
echo ""

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy workflows
cp -r "$SOURCE_DIR"/* "$TARGET_DIR"/

echo "✅ Workflows synced successfully!"
echo ""
echo "Synced files:"
ls -1 "$TARGET_DIR"
