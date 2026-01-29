type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (context) {
    return `${base} ${JSON.stringify(context)}`;
  }
  return base;
}

export const logger = {
  error(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('error')) console.error(formatMessage('error', message, context));
  },
  warn(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, context));
  },
  info(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('info')) console.info(formatMessage('info', message, context));
  },
  debug(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message, context));
  },
};
