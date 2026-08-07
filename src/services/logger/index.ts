import { LogLevel, LogPayload, LoggerOptions } from './types';
import { formatConsoleMessage } from './formatter';
import { recordLog } from '../firebase/logService';

class Logger {
  private enableConsole: boolean;
  private enableFirestore: boolean;

  constructor(options: LoggerOptions = {}) {
    this.enableConsole = options.enableConsole ?? true;
    this.enableFirestore = options.enableFirestore ?? true;
  }

  private async log(payload: LogPayload): Promise<void> {
    const timestamp = new Date().toISOString();
    const { level, message, context, data } = payload;

    // 1. Output ke Terminal / Console
    if (this.enableConsole) {
      const formatted = formatConsoleMessage(level, message, context, timestamp);
      if (level === 'ERROR') {
        console.error(formatted, data || '');
      } else if (level === 'WARN') {
        console.warn(formatted, data || '');
      } else {
        console.log(formatted, data || '');
      }
    }

    // 2. Simpan ke Firebase Firestore secara asynchronous
    if (this.enableFirestore) {
      try {
  const firestoreType: 'danger' | 'warning' | 'success' | 'info' =
    level === 'ERROR' ? 'danger' : level === 'WARN' ? 'warning' : level === 'SUCCESS' ? 'success' : 'info';
  const formattedContextMsg = context ? `[${context}] ${message}` : message;

  // Panggil service Firebase tanpa memblokir proses utama (fire-and-forget)
  recordLog('SYSTEM', firestoreType, formattedContextMsg).catch((err) => {
    console.error('[Logger Firebase Sync Error]:', err?.message || err);
  });
} catch (err) {
        // Fallback silently agar pencatatan log tidak merusak alur trading
      }
    }
  }

  // Menerima context (string) ATAU data (object) di argumen kedua,
  // agar kompatibel dengan pemanggilan logger.info(message, dataObject)
  // maupun logger.info(message, "ContextName", dataObject).
  private normalizeArgs(
    contextOrData?: string | unknown,
    data?: unknown
  ): { context?: string; data?: any } {
    if (typeof contextOrData === 'string' || contextOrData === undefined) {
      return { context: contextOrData as string | undefined, data };
    }
    return { context: undefined, data: contextOrData };
  }

  debug(message: string, contextOrData?: string | unknown, data?: unknown): void {
    const n = this.normalizeArgs(contextOrData, data);
    this.log({ level: 'DEBUG', message, context: n.context, data: n.data });
  }

  info(message: string, contextOrData?: string | unknown, data?: unknown): void {
    const n = this.normalizeArgs(contextOrData, data);
    this.log({ level: 'INFO', message, context: n.context, data: n.data });
  }

  success(message: string, contextOrData?: string | unknown, data?: unknown): void {
    const n = this.normalizeArgs(contextOrData, data);
    this.log({ level: 'SUCCESS', message, context: n.context, data: n.data });
  }

  warn(message: string, contextOrData?: string | unknown, data?: unknown): void {
    const n = this.normalizeArgs(contextOrData, data);
    this.log({ level: 'WARN', message, context: n.context, data: n.data });
  }

  error(message: string, contextOrData?: string | unknown, data?: unknown): void {
    const n = this.normalizeArgs(contextOrData, data);
    this.log({ level: 'ERROR', message, context: n.context, data: n.data });
  }
}

// Export sebagai Singleton Instance
const logger = new Logger();
export default logger;
export * from './types';
