#!/usr/bin/env node
import { Command } from "commander";
import { logger } from "symmetry-core";
import os from "os";
import path from "path";

import { SetupCommand } from "./setup";
import { SymmetryCLI } from "./start";

const program = new Command();

program
  .version("1.0.26")
  .description("symmetry cli")
  .option(
    "-c, --config <path>",
    "Path to config file",
    path.join(os.homedir(), ".config", "symmetry", "provider.yaml")
  );

program
  .command("setup")
  .description("Manually run setup to detect and configure local LLM servers")
  .action(async () => {
    try {
      await SetupCommand.execute();
    } catch (error) {
      logger.error("Setup failed:", error);
      process.exit(1);
    }
  });

program
  .command("start")
  .description("Start the Symmetry provider")
  .action(async () => {
    await SymmetryCLI.initialize(program.opts().config);
  });

program.action(async () => {
  await SymmetryCLI.initialize(program.opts().config);
});

program.parse(process.argv);
