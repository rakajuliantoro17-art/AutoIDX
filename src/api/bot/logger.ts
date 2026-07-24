/**
==========================================================
AutoIDX
Central Logger
Version : 0.0.1 Alpha
==========================================================
*/

import { BOT, LOG_LEVEL } from "./constants";

export type LogLevel =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export interface LogEntry {
  timestamp: string;

  level: LogLevel;

  module: string;

  message: string;

  data?: unknown;
}

function write(
  level: LogLevel,
  module: string,
  message: string,
  data?: unknown
): LogEntry {

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    data,
  };

  switch (level) {

    case LOG_LEVEL.SUCCESS:
      console.info(
        `✅ [${module}] ${message}`,
        data ?? ""
      );
      break;

    case LOG_LEVEL.WARNING:
      console.warn(
        `⚠️ [${module}] ${message}`,
        data ?? ""
      );
      break;

    case LOG_LEVEL.ERROR:
      console.error(
        `❌ [${module}] ${message}`,
        data ?? ""
      );
      break;

    default:
      console.info(
        `ℹ️ [${module}] ${message}`,
        data ?? ""
      );

  }

  return entry;
}

export const logger = {

  info(
    module: string,
    message: string,
    data?: unknown
  ) {
    return write(
      LOG_LEVEL.INFO,
      module,
      message,
      data
    );
  },

  success(
    module: string,
    message: string,
    data?: unknown
  ) {
    return write(
      LOG_LEVEL.SUCCESS,
      module,
      message,
      data
    );
  },

  warning(
    module: string,
    message: string,
    data?: unknown
  ) {
    return write(
      LOG_LEVEL.WARNING,
      module,
      message,
      data
    );
  },

  error(
    module: string,
    message: string,
    data?: unknown
  ) {
    return write(
      LOG_LEVEL.ERROR,
      module,
      message,
      data
    );
  },

};

export async function logStartup() {

  logger.success(
    "SYSTEM",
    `${BOT.NAME} v${BOT.VERSION} started.`
  );

}

export async function logShutdown() {

  logger.warning(
    "SYSTEM",
    `${BOT.NAME} stopped.`
  );

}
