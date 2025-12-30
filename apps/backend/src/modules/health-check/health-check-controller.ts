import { ok, getHttpError, Http } from '@/infra/http';
import { IController } from '@/modules/shared';

import { IHealthCheck } from '.';

type HealthCheckHandler = () => IHealthCheck;
export class HealthCheckController implements IController {
  constructor(private readonly healthCheckService: HealthCheckHandler) {}

  public async handle({ locals }: Http.IRequest): Promise<Http.IResponse> {
    try {
      const content = await this.healthCheckService().run({
        clientId: locals?.client?.id,
        traceId: locals?.traceId,
      });

      return ok({ content });
    } catch (error: any) {
      return getHttpError(error);
    }
  }
}
