import { Router } from 'express';

import { makeHealthCheckController } from '@/modules/health-check';
import { adaptRoute } from '@/routes/handlers';
import { authClientKeycloak } from '../middlewares/auth-client';

export default (router: Router): void => {
  router.get('/health', authClientKeycloak, adaptRoute(makeHealthCheckController()));
};
