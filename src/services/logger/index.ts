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

  debug(message: string, context?: string, data?: any): void {
    this.log({ level: 'DEBUG', message, context, data });
  }

  info(message: string, context?: string, data?: any): void {
    this.log({ level: 'INFO', message, context, data });
  }

  success(message: string, context?: string, data?: any): void {
    this.log({ level: 'SUCCESS', message, context, data });
  }

  warn(message: string, context?: string, data?: any): void {
    this.log({ level: 'WARN', message, context, data });
  }

  error(message: string, context?: string, data?: any): void {
    this.log({ level: 'ERROR', message, context, data });
  }
}

const logger = new Logger();
export default logger;
export { logger };
export * from './types';
