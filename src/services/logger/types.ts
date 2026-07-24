export type LogLevel = 'DEBUG' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

export interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string; // Nama modul/service pengirim (misal: 'IndodaxAPI', 'CronEngine')
  data?: any;       // Metadata tambahan / error object
  timestamp?: string;
}

export interface LoggerOptions {
  enableConsole?: boolean;
  enableFirestore?: boolean;
  minLevel?: LogLevel;
}
