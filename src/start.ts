#!/usr/bin/env node
import { logger, SymmetryClient } from "symmetry-core";
import os from "os";
import path from "path";
import fs from "fs/promises";

import { SetupCommand } from "./setup";

export class SymmetryCLI {
  private static readonly DEFAULT_CONFIG_DIR = path.join(
    os.homedir(),
    ".config",
    "symmetry"
  );
  private static readonly DEFAULT_CONFIG_PATH = path.join(
    this.DEFAULT_CONFIG_DIR,
    "provider.yaml"
  );

  static async initialize(configPath: string): Promise<void> {
    try {
      const hasConfig = await this.getConfigExists(configPath);

      if (!hasConfig) {
        logger.info("🔄 First-time setup detected, running initialization...");
        await SetupCommand.execute();
      }

      const client = new SymmetryClient(configPath);
      await client.init();
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Failed to initialize:", error.message);
      }
      process.exit(1);
    }
  }

  private static async getConfigExists(configPath: string): Promise<boolean> {
    try {
      await fs.access(configPath);
      return true;
    } catch {
      return false;
    }
  }

}
