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

  // Mendeteksi apakah argumen ke-2 adalah context (string) atau sebenarnya data (object/lainnya)
  private normalizeArgs(context?: string | any, data?: any): { context?: string; data?: any } {
    if (context !== undefined && typeof context !== 'string') {
      return { context: undefined, data: context };
    }
    return { context, data };
  }

  debug(message: string, context?: string | any, data?: any): void {
    const n = this.normalizeArgs(context, data);
    this.log({ level: 'DEBUG', message, context: n.context, data: n.data });
  }

  info(message: string, context?: string | any, data?: any): void {
    const n = this.normalizeArgs(context, data);
    this.log({ level: 'INFO', message, context: n.context, data: n.data });
  }

  success(message: string, context?: string | any, data?: any): void {
    const n = this.normalizeArgs(context, data);
    this.log({ level: 'SUCCESS', message, context: n.context, data: n.data });
  }

  warn(message: string, context?: string | any, data?: any): void {
    const n = this.normalizeArgs(context, data);
    this.log({ level: 'WARN', message, context: n.context, data: n.data });
  }

  error(message: string, context?: string | any, data?: any): void {
    const n = this.normalizeArgs(context, data);
    this.log({ level: 'ERROR', message, context: n.context, data: n.data });
  }
}

const logger = new Logger();
export default logger;
export { logger };
export * from './types';
