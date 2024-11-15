#!/usr/bin/env node
import { Command } from "commander";
import { SymmetryProvider } from 'symmetry-core'
import os from "os";
import path from "path";

const program = new Command();

program
  .version("1.0.14")
  .description("symmetry cli")
  .option(
    "-c, --config <path>",
    "Path to config file",
    path.join(os.homedir(), ".config", "symmetry", "provider.yaml")
  )
  .action(async () => {
    const client = new SymmetryProvider(program.opts().config);
    await client.init();
  });

program.parse(process.argv);
