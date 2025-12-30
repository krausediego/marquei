import { Router } from 'express';

import { makeHealthCheckController } from '@/modules/health-check';
import { adaptRoute } from '@/routes/handlers';

export default (router: Router): void => {
  router.get('/health', adaptRoute(makeHealthCheckController()));
};
