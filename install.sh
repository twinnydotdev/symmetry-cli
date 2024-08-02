#!/bin/sh
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_color() {
    printf '%b%s%b\n' "$1" "$2" "$NC"
}

# Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
    print_color "$RED" "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install symmetry-cli globally
print_color "$YELLOW" "Installing symmetry-cli globally..."
if npm install -g .; then
    print_color "$GREEN" "symmetry-cli installed successfully!"
else
    print_color "$RED" "Failed to install symmetry-cli. Please check your npm configuration and try again."
    exit 1
fi

# Prompt for API provider
print_color "$YELLOW" "Please select an API provider:"
print_color "$NC" "1) LiteLLM"
print_color "$NC" "2) LlamaCpp"
print_color "$NC" "3) LMStudio"
print_color "$NC" "4) Ollama"
print_color "$NC" "5) Oobabooga"
print_color "$NC" "6) OpenWebUI"

api_provider=""
while [ -z "$api_provider" ]; do
    printf "Enter the number of your choice: "
    read -r choice
    case $choice in
        1) api_provider="litellm" ;;
        2) api_provider="llamacpp" ;;
        3) api_provider="lmstudio" ;;
        4) api_provider="ollama" ;;
        5) api_provider="oobabooga" ;;
        6) api_provider="openwebui" ;;
        *) print_color "$RED" "Invalid option. Please try again." ;;
    esac
done

# Prompt for model name
print_color "$YELLOW" "Please enter the model name you want to serve e.g 'llama3.1:latest':"
read -r model_name

# Create config directory and provider.yaml file
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
apiProvider: $api_provider
dataCollectionEnabled: true
maxConnections: 10
modelName: $model_name
name: $(whoami)
path: $config_dir
public: true
serverKey: 4b4a9cc325d134dee6679e9407420023531fd7e96c563f6c5d00fd5549b77435
EOF
    print_color "$GREEN" "provider.yaml created successfully at $provider_yaml"
else
    print_color "$YELLOW" "provider.yaml already exists at $provider_yaml"
fi

print_color "$GREEN" "Installation complete! You can now run 'symmetry-cli' to start your node."
print_color "$YELLOW" "Please edit $provider_yaml to customize your provider settings, especially:"
print_color "$YELLOW" "  - apiKey: Add your API key if required"
print_color "$YELLOW" "  - name: Currently set to your system username, change if needed"
print_color "$YELLOW" "  - public: Set to true by default, change to false if you don't want to be publicly accessible"