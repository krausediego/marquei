import pino from 'pino';

import { ILoggingManager, LoggingManager } from '..';

type objectOrMessageType = string | Error | Record<string, any>;

const isDev = process.env.NODE_ENV !== 'production';

export class PinoLoggingAdapter implements ILoggingManager {
  private readonly pino: pino.Logger;

  constructor() {
    this.pino = pino({
      messageKey: 'message',
      level: 'debug',
      timestamp: false,
      formatters: {
        level: this.mapLevelToSeverity.bind(this),
      },
      transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
              messageKey: 'message',
              ignore: 'severity',
            },
          }
        : undefined,
    });
  }

  private mapLevelToSeverity(label: string, level: number): Record<string, string | number> {
    const mapLevelToSeverity = new Map([
      ['trace', 'DEBUG'],
      ['debug', 'DEBUG'],
      ['info', 'INFO'],
      ['warn', 'WARNING'],
      ['error', 'FATAL'],
      ['fatal', 'CRITICAL'],
    ]);
    const severity = mapLevelToSeverity.get(label.toLocaleLowerCase()) ?? 'DEFAULT';
    return { severity, level };
  }

  private handle(
    severity: LoggingManager.SeverityKeys,
    objectOrMessage: objectOrMessageType,
    message?: string
  ): void {
    if (typeof objectOrMessage === 'string') {
      this.pino[severity]('%s', objectOrMessage);
    } else if (objectOrMessage instanceof Error) {
      const errorMessage = message ?? objectOrMessage.message ?? objectOrMessage.stack;

      this.pino[severity](objectOrMessage, errorMessage);
    } else {
      this.pino[severity](objectOrMessage, message);
    }
  }

  writeLog(
    severity: LoggingManager.SeverityKeys,
    message: string,
    object?: Error | Record<string, any>
  ): void {
    this.handle(severity, object ?? message, object ? message : undefined);
  }

  debug(objectOrMessage: objectOrMessageType, message?: string): void {
    this.handle('debug', objectOrMessage, message);
  }

  info(objectOrMessage: objectOrMessageType, message?: string): void {
    this.handle('info', objectOrMessage, message);
  }

  warn(objectOrMessage: objectOrMessageType, message?: string): void {
    this.handle('warn', objectOrMessage, message);
  }

  error(objectOrMessage: objectOrMessageType, message?: string): void {
    this.handle('error', objectOrMessage, message);
  }

  fatal(objectOrMessage: objectOrMessageType, message?: string): void {
    this.handle('fatal', objectOrMessage, message);
  }
}
