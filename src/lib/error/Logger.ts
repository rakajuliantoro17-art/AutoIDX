/**
==========================================================
AURA Trade OS
Application Logger
Version : 0.0.5 Alpha
==========================================================
*/

export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error";

export interface LogContext {
  service?: string;
  module?: string;
  pair?: string;
  userId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
}

const isDevelopment =
  process.env.NODE_ENV !== "production";

class Logger {

  private write(entry: LogEntry): void {

    const prefix =
      `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;

    if (entry.context) {

      switch (entry.level) {

        case "debug":
          console.debug(prefix, entry.message, entry.context);
          break;

        case "info":
          console.info(prefix, entry.message, entry.context);
          break;

        case "warn":
          console.warn(prefix, entry.message, entry.context);
          break;

        case "error":
          console.error(prefix, entry.message, entry.context);
          break;

      }

    } else {

      switch (entry.level) {

        case "debug":
          console.debug(prefix, entry.message);
          break;

        case "info":
          console.info(prefix, entry.message);
          break;

        case "warn":
          console.warn(prefix, entry.message);
          break;

        case "error":
          console.error(prefix, entry.message);
          break;

      }

    }

  }

  debug(
    message: string,
    context?: LogContext
  ): void {

    if (!isDevelopment) {
      return;
    }

    this.write({
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      context,
    });

  }

  info(
    message: string,
    context?: LogContext
  ): void {

    this.write({
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      context,
    });

  }

  warn(
    message: string,
    context?: LogContext
  ): void {

    this.write({
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      context,
    });

  }

  error(
    message: string,
    error?: unknown,
    context?: LogContext
  ): void {

    this.write({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: isDevelopment
                  ? error.stack
                  : undefined,
              }
            : error,
      },
    });

  }

}

const logger = new Logger();

export default logger;
