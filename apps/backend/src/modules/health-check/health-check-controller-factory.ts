import { IController } from '@/modules/shared';

import { HealthCheckController, makeHealthCheckService } from './index';

export const makeHealthCheckController = (): IController => {
  return new HealthCheckController(makeHealthCheckService);
};
