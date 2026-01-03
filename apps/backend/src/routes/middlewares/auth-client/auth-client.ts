import { adaptMiddleware } from '@/routes/handlers';

import { makeAuthClientKeycloakMiddleware } from './auth-client-factory';

export const authClientKeycloak = adaptMiddleware(makeAuthClientKeycloakMiddleware());
