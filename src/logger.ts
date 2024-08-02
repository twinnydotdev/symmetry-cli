/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";

export enum LogLevel {
  DEBUG,
  ERROR,
  INFO,
  WARNING,
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(chalk.blue("ℹ️ INFO:"), message, ...args);
    }
  }

  public warning(message: string, ...args: any[]): void {
    console.log(chalk.yellow("⚠️ WARNING:"), message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.error(chalk.red("❌ ERROR:"), message, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    console.log(chalk.gray("🐛 DEBUG:"), message, ...args);
  }
}

export const logger = Logger.getInstance();
