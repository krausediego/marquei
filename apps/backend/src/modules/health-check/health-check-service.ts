import { ILoggingManager } from '@/infra';
import { BaseService } from '@/modules/shared';

import { HealthCheck, IHealthCheck } from '.';

export class HealthCheckService extends BaseService implements IHealthCheck {
  constructor(protected readonly logger: ILoggingManager) {
    super(logger);
  }

  async run(params: HealthCheck.Params): Promise<HealthCheck.Response> {
    const { traceId } = params;
    this.traceId = traceId;

    this.log('info', 'Health check called.');

    return true;
  }
}
