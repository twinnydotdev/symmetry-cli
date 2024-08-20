import { PassThrough, Readable } from "node:stream";
import { pipeline } from "stream/promises";
import chalk from "chalk";
import Hyperswarm from "hyperswarm";
import crypto from "hypercore-crypto";
import fs from "node:fs";

import { ConfigManager } from "./config";
import {
  createMessage,
  getChatDataFromProvider,
  safeParseJson,
  safeParseStreamResponse,
} from "./utils";
import { logger } from "./logger";
import { Peer, ProviderMessage, InferenceRequest, Message } from "./types";
import { PROVIDER_HELLO_TIMEOUT, serverMessageKeys } from "./constants";

export class SymmetryProvider {
  private _challenge: Buffer | null = null;
  private _config: ConfigManager;
  private _conversationIndex = 0;
  private _discoveryKey: Buffer | null = null;
  private _isPublic = false;
  private _providerConnections: number = 0;
  private _providerSwarm: Hyperswarm | null = null;
  private _serverSwarm: Hyperswarm | null = null;
  private _serverPeer: Peer | null = null;

  constructor(configPath: string) {
    logger.info(`🔗 Initializing client using config file: ${configPath}`);
    this._config = new ConfigManager(configPath);
    this._isPublic = this._config.get("public");
  }

  async init(): Promise<void> {
    this._providerSwarm = new Hyperswarm({
      maxConnections: this._config.get("maxConnections"),
    });
    const keyPair = crypto.keyPair(
      Buffer.alloc(32).fill(this._config.get("name"))
    );
    this._discoveryKey = crypto.discoveryKey(keyPair.publicKey);
    const discovery = this._providerSwarm.join(this._discoveryKey, {
      server: true,
      client: true,
    });
    await discovery.flushed();

    this._providerSwarm.on("error", (err: Error) => {
      logger.error(chalk.red("🚨 Swarm Error:"), err);
    });

    this._providerSwarm.on("connection", (peer: Peer) => {
      logger.info(`⚡️ New connection from peer: ${peer.rawStream.remoteHost}`);
      this.listeners(peer);
    });

    logger.info(`📁 Symmetry client initialized.`);
    logger.info(`🔑 Discovery key: ${this._discoveryKey.toString("hex")}`);

    if (this._isPublic) {
      logger.info(
        chalk.white(`🔑 Server key: ${this._config.get("serverKey")}`)
      );
      logger.info(chalk.white("🔗 Joining server, please wait."));
      this.joinServer();
    }

    process.on("SIGINT", async () => {
      await this._providerSwarm?.destroy();
      process.exit(0);
    });

    process.on("uncaughtException", (err) => {
      if (err.message === "connection reset by peer") {
        this._providerConnections = Math.max(0, this._providerConnections - 1);
      }
    });
  }

  async destroySwarms() {
    await this._providerSwarm?.destroy();
    await this._serverSwarm?.destroy();
  }

  private async testProviderCall(): Promise<void> {
    const testCall = async () => {
      logger.info(chalk.white(`👋 Saying hello to your provider...`));
      const testMessages: Message[] = [
        { role: "user", content: "Hello, this is a test message." },
      ];
      const req = this.buildStreamRequest(testMessages);

      if (!req) {
        logger.error(chalk.red("❌ Failed to build test request"));
        throw new Error("Failed to build test request");
      }

      const { requestOptions, requestBody } = req;
      const { protocol, hostname, port, path, method, headers } =
        requestOptions;
      const url = `${protocol}://${hostname}:${port}${path}`;

      logger.info(chalk.white(`🚀 Sending test request to ${url}`));

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          logger.error(
            chalk.red(
              `❌ Server responded with status code: ${response.status}`
            )
          );
          this.destroySwarms();
          throw new Error(
            `Server responded with status code: ${response.status}`
          );
        }

        if (!response.body) {
          logger.error(
            chalk.red("❌ Failed to get a ReadableStream from the response")
          );
          this.destroySwarms();
          throw new Error("Failed to get a ReadableStream from the response");
        }

        logger.info(chalk.white(`📡 Got response, checking stream...`));

        const reader = response.body.getReader();
        const { done } = await reader.read();
        if (done) {
          logger.error(chalk.red("❌ Stream ended without data"));
          this.destroySwarms();
          throw new Error("Stream ended without data");
        }

        logger.info(chalk.green(`✅ Test inference call successful!`));
      } catch (error) {
        this.destroySwarms();
        logger.error(
          chalk.red(`❌ Error during test inference call: ${error}`)
        );
        throw error;
      }

      logger.info(chalk.white(`🔗 Test call successful!`));
    };

    setTimeout(() => testCall(), PROVIDER_HELLO_TIMEOUT)
  }

  async joinServer(): Promise<void> {
    this._serverSwarm = new Hyperswarm();
    const serverKey = Buffer.from(this._config.get("serverKey"));
    this._serverSwarm.join(crypto.discoveryKey(serverKey), {
      client: true,
      server: false,
    });
    this._serverSwarm.flush();
    this._serverSwarm.on("connection", (peer: Peer) => {
      this._serverPeer = peer;
      logger.info(chalk.green("🔗 Connected to server."));

      this.testProviderCall();

      this._challenge = crypto.randomBytes(32);

      this._serverPeer.write(
        createMessage(serverMessageKeys.challenge, {
          challenge: this._challenge,
        })
      );

      this._serverPeer.write(
        createMessage(serverMessageKeys.join, {
          ...this._config.getAll(),
          discoveryKey: this._discoveryKey?.toString("hex"),
        })
      );

      this._serverPeer.on("data", async (buffer: Buffer) => {
        if (!buffer) return;

        const data = safeParseJson<
          ProviderMessage<{ message: string; signature: { data: string } }>
        >(buffer.toString());

        if (data && data.key) {
          switch (data.key) {
            case serverMessageKeys.challenge:
              this.handleServerVerification(
                data.data as { message: string; signature: { data: string } }
              );
              break;
            case serverMessageKeys.ping:
              this._serverPeer?.write(createMessage(serverMessageKeys.pong));
              break;
          }
        }
      });
    });
  }

  getServerPublicKey(serverKeyHex: string): Buffer {
    const publicKey = Buffer.from(serverKeyHex, "hex");
    if (publicKey.length !== 32) {
      throw new Error(
        `Expected a 32-byte public key, but got ${publicKey.length} bytes`
      );
    }
    return publicKey;
  }

  handleServerVerification(data: {
    message: string;
    signature: { data: string };
  }) {
    if (!this._challenge) {
      console.log("No challenge set. Cannot verify.");
      return;
    }

    const serverKeyHex = this._config.get("serverKey");
    try {
      const publicKey = this.getServerPublicKey(serverKeyHex);
      const signatureBuffer = Buffer.from(data.signature.data, "base64");

      const verified = crypto.verify(
        this._challenge,
        signatureBuffer,
        publicKey
      );

      if (verified) {
        logger.info(chalk.greenBright(`✅ Verification successful.`));
      } else {
        logger.error(`❌ Verification failed!`);
      }
    } catch (error) {
      console.error("Error during verification:", error);
    }
  }

  private listeners(peer: Peer): void {
    peer.on("data", async (buffer: Buffer) => {
      if (!buffer) return;
      const data = safeParseJson<ProviderMessage<InferenceRequest>>(
        buffer.toString()
      );
      if (data && data.key) {
        switch (data.key) {
          case serverMessageKeys.newConversation:
            this._conversationIndex = this._conversationIndex + 1;
            break;
          case serverMessageKeys.inference:
            logger.info(
              `📦 Inference message received from ${peer.rawStream.remoteHost}`
            );
            await this.handleInferenceRequest(data, peer);
            break;
        }
      }
    });
  }

  private getMessagesWithSystem(messages: Message[]): Message[] {
    const systemMessage = this._config.get("systemMessage");
    if (messages.length === 2 && systemMessage) {
      messages.unshift({
        role: "system",
        content: systemMessage,
      });
    }
    return messages;
  }

  private async handleInferenceRequest(
    data: ProviderMessage<InferenceRequest>,
    peer: Peer
  ): Promise<void> {
    const emitterKey = data.data.key;
    const messages = this.getMessagesWithSystem(data?.data.messages);
    const req = this.buildStreamRequest(messages);

    if (!req) return;

    const { requestOptions, requestBody } = req;
    const { protocol, hostname, port, path, method, headers } = requestOptions;
    const url = `${protocol}://${hostname}:${port}${path}`;

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Server responded with status code: ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error("Failed to get a ReadableStream from the response");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseStream = Readable.fromWeb(response.body as any);
      const peerStream = new PassThrough();
      responseStream.pipe(peerStream);
      let completion = "";

      const provider = this._config.get("apiProvider");

      peer.write(
        JSON.stringify({
          symmetryEmitterKey: emitterKey,
        })
      );

      const peerPipeline = pipeline(peerStream, async function (source) {
        for await (const chunk of source) {
          if (peer.writable) {
            completion += getChatDataFromProvider(
              provider,
              safeParseStreamResponse(chunk.toString())
            );

            const write = peer.write(chunk);

            if (!write) {
              await new Promise((resolve) => peer.once("drain", resolve));
            }
          } else {
            break;
          }
        }
      });
      await Promise.resolve(peerPipeline);

      peer.write(
        createMessage(serverMessageKeys.inferenceEnded, data?.data.key)
      );

      if (
        this._config.get("dataCollectionEnabled") &&
        data.data.key === serverMessageKeys.inference
      ) {
        this.saveCompletion(completion, peer, data.data.messages);
      }
    } catch (error) {
      let errorMessage = "An error occurred during inference";
      if (error instanceof Error) errorMessage = error.message;
      logger.error(`🚨 ${errorMessage}`);
    }
  }

  private async saveCompletion(
    completion: string,
    peer: Peer,
    messages: Message[]
  ) {
    fs.writeFile(
      `${this._config.get("path")}/${peer.publicKey.toString("hex")}-${
        this._conversationIndex
      }.json`,
      JSON.stringify([
        ...messages,
        {
          role: "assistant",
          content: completion,
        },
      ]),
      () => {
        logger.info(`📝 Completion saved to file`);
      }
    );
  }

  private buildStreamRequest(messages: Message[]) {
    const requestOptions = {
      hostname: this._config.get("apiHostname"),
      port: Number(this._config.get("apiPort")),
      path: this._config.get("apiPath"),
      protocol: this._config.get("apiProtocol"),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._config.get("apiKey")}`,
      },
    };

    const requestBody = {
      model: this._config.get("modelName"),
      messages: messages || undefined,
      stream: true,
    };

    return { requestOptions, requestBody };
  }
}

export default SymmetryProvider;
