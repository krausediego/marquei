import { makeLogging, HashManager } from '@/infra';
import { IMiddleware } from '@/routes/middlewares';

import { TraceMiddleware } from './trace-middleware';

export const makeTraceMiddleware = (): IMiddleware => {
  const hashManager = new HashManager();
  const logger = makeLogging();
  return new TraceMiddleware(hashManager, logger);
};
