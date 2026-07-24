import { LogLevel } from './types';

const COLOR_CODES: Record<LogLevel, string> = {
  DEBUG: '\x1b[36m',   // Cyan
  INFO: '\x1b[34m',    // Blue
  SUCCESS: '\x1b[32m', // Green
  WARN: '\x1b[33m',    // Yellow
  ERROR: '\x1b[31m',   // Red
};

const RESET_COLOR = '\x1b[0m';

/**
 * Format string log untuk output console/terminal
 */
export function formatConsoleMessage(
  level: LogLevel,
  message: string,
  context?: string,
  timestamp?: string
): string {
  const timeStr = timestamp || new Date().toISOString();
  const color = COLOR_CODES[level] || RESET_COLOR;
  const ctxStr = context ? `[${context}]` : '';

  return `${COLOR_CODES.DEBUG}[${timeStr}]${RESET_COLOR} ${color}[${level}]${RESET_COLOR} ${ctxStr} ${message}`;
}
