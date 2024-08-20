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

config_dir="$HOME/.config/symmetry"
provider_yaml="$config_dir/provider.yaml"

mkdir -p "$config_dir"

if [ ! -f "$provider_yaml" ]; then
    print_color "$YELLOW" "Creating provider.yaml file..."
    cat << EOF > "$provider_yaml"
# Symmetry Configuration
apiHostname: localhost
apiKey: 
apiPath: /v1/chat/completions
apiPort: 11434
apiProtocol: http
apiProvider: ollama
dataCollectionEnabled: true
maxConnections: 10
modelName: llama3.1:latest
name: $(whoami)
path: $config_dir
public: true
systemMessage:
serverKey: 4b4a9cc325d134dee6679e9407420023531fd7e96c563f6c5d00fd5549b77435

EOF
    print_color "$GREEN" "provider.yaml created successfully at $provider_yaml"
else
    print_color "$YELLOW" "provider.yaml already exists at $provider_yaml"
fi

print_color "$GREEN" "Installation complete! You can now run 'symmetry-cli' to start your node."
print_color "$YELLOW" "Please edit $provider_yaml to customize your provider settings:"
