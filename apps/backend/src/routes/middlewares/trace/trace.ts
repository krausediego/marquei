import { adaptMiddleware } from '@/routes/handlers';

import { makeTraceMiddleware } from './trace-factory';

export const trace = adaptMiddleware(makeTraceMiddleware());
