# Symmetry CLI Install Script for Windows
$ErrorActionPreference = "Stop"

$RED = "`e[31m"
$GREEN = "`e[32m"
$YELLOW = "`e[33m"
$NC = "`e[0m"

function Print-Color($color, $message) {
    Write-Host "$color$message$NC"
}

if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Print-Color $RED "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
}

Print-Color $YELLOW "Installing symmetry-cli globally..."
if (npm install -g symmetry-cli) {
    Print-Color $GREEN "symmetry-cli installed successfully!"
} else {
    Print-Color $RED "Failed to install symmetry-cli. Please check your npm configuration and try again."
    exit 1
}

$config_dir = "$env:USERPROFILE\.config\symmetry"
$provider_yaml = "$config_dir\provider.yaml"

New-Item -ItemType Directory -Force -Path $config_dir | Out-Null

if (!(Test-Path $provider_yaml)) {
    Print-Color $YELLOW "Creating provider.yaml file..."
    @"
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
name: $env:USERNAME
path: $config_dir
public: true
systemMessage:
serverKey: 4b4a9cc325d134dee6679e9407420023531fd7e96c563f6c5d00fd5549b77435
"@ | Set-Content $provider_yaml
    Print-Color $GREEN "provider.yaml created successfully at $provider_yaml"
} else {
    Print-Color $YELLOW "provider.yaml already exists at $provider_yaml"
}

Print-Color $GREEN "Installation complete! You can now run 'symmetry-cli' to start your node."
Print-Color $YELLOW "Please edit $provider_yaml to customize your provider settings, especially:"
Print-Color $YELLOW "  - apiKey: Add your API key if required"
Print-Color $YELLOW "  - name: Currently set to your system username, change if needed"
Print-Color $YELLOW "  - public: Set to true by default, change to false if you don't want to be publicly accessible"
