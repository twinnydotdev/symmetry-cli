import {
  BaseProvider,
  LlamaCppProvider,
  LMStudioProvider,
  logger,
  OllamaProvider,
  OpenWebUIProvider,
} from "symmetry-core";

export class SetupCommand {
  static async execute(): Promise<void> {
    logger.info("🔍 Checking for running LLM servers...");

    const providers = [
      new OllamaProvider(),
      new OpenWebUIProvider(),
      new LMStudioProvider(),
      new LlamaCppProvider(),
    ];

    for (const provider of providers) {
      const server = await provider.detectServer();
      if (server) {
        await provider.setup();
        logger.info(
          `📝 Configuration file created at: ${BaseProvider.DEFAULT_CONFIG_PATH}/provider.yaml`
        );
        return;
      }
    }

    logger.error("❌ No supported LLM servers detected.");
  }
}
