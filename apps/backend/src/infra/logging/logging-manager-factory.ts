import { ILoggingManager } from '.';
import { PinoLoggingAdapter } from './pino';

export const makeLogging = (): ILoggingManager => {
  return new PinoLoggingAdapter();
};
