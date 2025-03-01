# Symmetry

Use this repository to become an inference provider on the Symmetry network.

Symmetry is a distributed peer-to-peer network tool that allows users to share computational resources for AI inference. It enables users to connect directly and securely with each other, offering or seeking computational power for various AI tasks.

## Features

- Decentralized peer-to-peer network
- YAML-based configuration
- Privacy options
- Optional data collection for providers
- Compatible with various AI inference providers

## Installation

To install Symmetry, use the following commands:

For Linux and macOS:
```bash
curl -fsSL https://www.twinny.dev/symmetry-unix.sh | sh
```

For Windows:
```powershell
iwr -useb https://www.twinny.dev/symmetry-windows.ps1 | iex
```

## Usage

To start Symmetry, run which will create a config file and detect your provider.

```bash
symmetry-cli start
```

You will then be joined with the symmetry server and ready for connections!

```bash
ℹ️ INFO: 🔗 Initializing client using config file: /home/twinnydotdev/.config/symmetry/provider.yaml
ℹ️ INFO: 📁 Symmetry client initialized.
ℹ️ INFO: 🔑 Discovery key: xxx
ℹ️ INFO: 🔑 Server key: 4b4a9cc325d134dee6679e9407420023531fd7e96c563f6c5d00fd5549b77435
ℹ️ INFO: 🔗 Joining server, please wait.
ℹ️ INFO: 🔗 Connected to server.
ℹ️ INFO: ✅ Verification successful.
ℹ️ INFO: 👋 Saying hello to your provider...
ℹ️ INFO: 🚀 Sending test request to http://localhost:11434/v1/chat/completions
ℹ️ INFO: 📡 Got response, checking stream...
ℹ️ INFO: ✅ Test inference call successful!
```

By default, Symmetry looks for its configuration file at `~/.config/symmetry/provider.yaml`. To use a different configuration file, use:

```bash
symmetry-cli start -c /path/to/your/provider.yaml
```

## Configuration

Here's an example `provider.yaml` configuration:

```yaml
apiHostname: localhost  # The hostname of the API server.
apiKey:  # The API key for authentication.
apiBasePath: /v1  # The endpoint path for the api.
apiPort: 11434  # The port number on which the API server is listening.
apiProtocol: http  # The protocol used to communicate with the API server.
apiProvider: ollama  # The name of the API provider.
dataCollectionEnabled: false  # Whether to enable data collection.
maxConnections: 10  # The maximum number of connections.
modelName: llama3.1:latest  # The name and version of the AI model to use.
name: twinnydotdev  # Your chosen name as a provider on the Symmetry network.
dataPath: /home/twinnydotdev/.config/symmetry/data  # The local path where Symmetry will store its configuration and data files.
public: true  # Whether this provider is publicly accessible on the Symmetry network.
serverKey: 4b4a9cc325d134dee6679e9407420023531fd7e96c563f6c5d00fd5549b77435  # The unique key for connecting to the Symmetry server.
systemMessage: "I'm a system message" # An optional system message for each conversation.
userSecret: # The secret key for user authentication and points tracking.
```

Adjust these settings according to your preferences and setup.

## Architecture

```mermaid
graph TB
    S[Symmetry Server]
    
    subgraph "Inference Providers"
        P1[Provider 1]
        P2[Provider 2]
        P3[Provider 3]
    end
    
    subgraph "Clients"
        C1[Client 1 Requests Model B]
        C2[Client 2 Requests Model C]
    end
    
    P1 <--> |"1. Connect & Auth & Register Model"| S
    P2 <--> |"1. Connect & Auth & Register Model"| S
    P3 <--> |"1. Connect & Auth & Register Model"| S
    
    C1 -- "2. Connect" --> S
    C2 -- "2. Connect" --> S
    
    S -- "3. Assign Provider based on Model" --> C1
    S -- "3. Assign Provider based on Model" --> C2
    
    C1 <--> |"4. Inference Request/Response"| P2
    C2 <--> |"4. Inference Request/Response"| P3
```

## Development

To set up Symmetry for development:

1. Clone the repository:
   ```bash
   git clone https://github.com/twinnydotdev/symmetry.git
   cd symmetry
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Please submit your pull requests to the [GitHub repository](https://github.com/twinnydotdev/symmetry/pulls).

## License

This project is licensed under the [Apache 2.0 Licence](https://github.com/twinnydotdev/symmetry/blob/master/LICENCE).

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/twinnydotdev/symmetry/issues) on GitHub.

## Acknowledgments

We thank [Hyperswarm](https://github.com/holepunchto/hyperswarm) for providing the underlying peer-to-peer networking capabilities.

