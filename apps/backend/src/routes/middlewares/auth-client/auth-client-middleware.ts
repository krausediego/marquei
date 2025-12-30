import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

import { ILoggingManager, ok, getHttpError, Http, ForbiddenError } from '@/infra';
import { KeycloakEnv as env } from '@/infra/config';
import { IMiddleware } from '@/routes/middlewares';

const AUTHORIZATION_HEADER_NOT_PROVIDED = 'Authorization header was not provided.';
const INVALID_AUTHORIZATION_HEADER = 'Authorization header is invalid.';
const UNAUTHORIZED = 'Unauthorized.';

const jwks = createRemoteJWKSet(
  new URL(`${env.keycloakBaseUrl}/realms/${env.keycloakRealm}/protocol/openid-connect/certs`)
);

type KeycloakAccessPayload = JWTPayload & {
  email?: string;
  preferred_username?: string;
  name?: string;
  anotherVarsHere?: unknown;
};

export class AuthClientKeycloakMiddleware implements IMiddleware {
  constructor(private readonly logger: ILoggingManager) {}

  async handle(params: Http.IRequest<{ authorization: string }>): Promise<Http.IResponse> {
    const { traceId } = params.locals || {};
    const { authorization } = params.data;

    try {
      if (!authorization) {
        return getHttpError(new ForbiddenError(AUTHORIZATION_HEADER_NOT_PROVIDED));
      }

      const [authPrefix, authToken] = authorization.split(' ');

      if (authPrefix !== 'Bearer' || !authToken) {
        return getHttpError(new ForbiddenError(INVALID_AUTHORIZATION_HEADER));
      }

      const issuer = `${env.keycloakBaseUrl}/realms/${env.keycloakRealm}`;

      const { payload } = await jwtVerify<KeycloakAccessPayload>(authToken, jwks, {
        issuer,
        audience: env.keycloakAudience,
      });

      const clientId = payload.sub;
      if (!clientId) {
        return getHttpError(new ForbiddenError(UNAUTHORIZED));
      }

      const email = payload.email;
      const anotherVarsHere = payload.anotherVarsHere;

      return ok({
        client: {
          id: clientId,
          email,
          anotherVarsHere,
        },
      });
    } catch (error: any) {
      this.logger.warn({ traceId }, error?.message);
      return getHttpError(new ForbiddenError(UNAUTHORIZED));
    }
  }
}
