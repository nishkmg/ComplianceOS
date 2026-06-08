import { redactPII, redactObjectValues } from './pii-redactor';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  projector?: string;
  aggregateId?: string;
  eventId?: string;
  eventType?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

let sentryAvailable = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/nextjs');
  sentryAvailable = !!Sentry.captureException;
} catch {
  sentryAvailable = false;
}

function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify({
    ...entry,
    timestamp: new Date(entry.timestamp).toISOString(),
  });
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  // PII-redact message and context before emitting
  const redactedMsg = redactPII(message);
  const redactedCtx = context ? redactObjectValues(context as Record<string, unknown>) as LogContext : undefined;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: redactedMsg,
    context: redactedCtx,
    ...(error && {
      error: {
        name: error.name,
        message: redactPII(error.message),
        stack: error.stack,
      },
    }),
  };

  const formatted = formatLogEntry(entry);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      maybeCaptureToSentry(entry);
      break;
  }
}

function maybeCaptureToSentry(entry: LogEntry): void {
  if (!sentryAvailable || process.env.NODE_ENV !== 'production') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    const extras: Record<string, unknown> = {};
    if (entry.context) extras.context = entry.context;
    if (entry.error) {
      const err = new Error(entry.error.message);
      err.name = entry.error.name;
      err.stack = entry.error.stack;
      Sentry.captureException(err, { level: 'error', extra: extras });
    } else {
      Sentry.captureMessage(entry.message, 'error');
    }
  } catch {
    // Sentry not available this cycle — skip
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, error: Error, context?: LogContext) =>
    log('error', message, context, error),

  child: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      log('debug', message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log('info', message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log('warn', message, { ...baseContext, ...context }),
    error: (message: string, error: Error, context?: LogContext) =>
      log('error', message, { ...baseContext, ...context }, error),
  }),
};

export function withRequestLogging<T>(
  requestId: string,
  fn: () => Promise<T>,
  operation: string,
): Promise<T> {
  const startTime = Date.now();
  logger.info(`${operation} started`, { requestId, operation });

  return fn()
    .then((result) => {
      const duration = Date.now() - startTime;
      logger.info(`${operation} completed`, { requestId, operation, duration });
      return result;
    })
    .catch((error: Error) => {
      const duration = Date.now() - startTime;
      logger.error(`${operation} failed`, error, { requestId, operation, duration });
      throw error;
    });
}
