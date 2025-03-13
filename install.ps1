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

Print-Color $GREEN "Installation complete! You can now run 'symmetry-cli start' to start your node."
