import { makeLogging } from '@/infra';

import { IHealthCheck, HealthCheckService } from '.';

export const makeHealthCheckService = (): IHealthCheck => {
  return new HealthCheckService(makeLogging());
};
