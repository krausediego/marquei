import { makeLogging } from '@/infra';

import { IMiddleware } from '..';

import { AuthClientKeycloakMiddleware } from './auth-client-middleware';

export const makeAuthClientKeycloakMiddleware = (): IMiddleware => {
  return new AuthClientKeycloakMiddleware(makeLogging());
};
