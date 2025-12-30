import { adaptMiddleware } from '@/routes/handlers';

import { makeAuthClientKeycloakMiddleware } from '.';

export const authClientKeycloak = adaptMiddleware(makeAuthClientKeycloakMiddleware());
