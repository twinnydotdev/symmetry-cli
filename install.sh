#!/usr/bin/env bash
# Symmetry CLI Install Script for macOS/Linux

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_color() {
    printf '%b%s%b\n' "$1" "$2" "$NC"
}

if ! command -v npm >/dev/null 2>&1; then
    print_color "$RED" "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

print_color "$YELLOW" "Installing symmetry-cli globally..."
if npm install -g symmetry-cli; then
    print_color "$GREEN" "symmetry-cli installed successfully!"
else
    print_color "$RED" "Failed to install symmetry-cli. Please check your npm configuration and try again."
    exit 1
fi

print_color "$GREEN" "Installation complete! You can now run 'symmetry-cli start' to start your node."
