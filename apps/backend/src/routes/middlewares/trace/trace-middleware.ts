import { ok, Http, ILoggingManager, IRandomGeneratorHash } from '@/infra';
import { IMiddleware } from '@/routes/middlewares';

export class TraceMiddleware implements IMiddleware {
  constructor(
    private readonly hash: IRandomGeneratorHash,
    private readonly logger: ILoggingManager
  ) {}

  async handle({ method, path }: Http.IRequest): Promise<Http.IResponse> {
    const traceId = this.hash.generateRandomHash();

    if (path !== '/' || method !== 'GET') {
      this.logger.writeLog('info', `${method} ${path}`, {
        method,
        path,
        traceId,
      });
    }

    return ok({ traceId });
  }
}
