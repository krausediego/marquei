import { makeLogging } from '@/infra';

import { IMiddleware } from '..';

import { AuthClientKeycloakMiddleware } from '.';

export const makeAuthClientKeycloakMiddleware = (): IMiddleware => {
  return new AuthClientKeycloakMiddleware(makeLogging());
};
