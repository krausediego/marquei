import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

import { ILoggingManager, ok, getHttpError, Http, ForbiddenError } from '@/infra';
import { KeycloakEnv as env } from '@/infra/config';
import { IMiddleware } from '@/routes/middlewares';

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
    const authorization = params.data.authorization || params.data['authorization'];

    try {
      if (!authorization) {
        this.logger.warn({ traceId }, 'Authorization header not provided.');
        return getHttpError(new ForbiddenError('Token de autorização não fornecido', 3001));
      }

      const [authPrefix, authToken] = authorization.split(' ');

      if (authPrefix !== 'Bearer' || !authToken) {
        this.logger.writeLog('warn', 'Invalid authorization header format.', { traceId });
        return getHttpError(new ForbiddenError('Formato de token inválido', 3002));
      }

      const issuer = `${env.keycloakBaseUrl}/realms/${env.keycloakRealm}`;
      const validAudiences = [env.keycloakAudience, 'account'];

      const { payload } = await jwtVerify<KeycloakAccessPayload>(authToken, jwks, {
        issuer,
        audience: validAudiences,
      });

      const clientId = payload.sub;
      if (!clientId) {
        this.logger.writeLog('warn', 'Token payload missing subject (sub).', { traceId });
        return getHttpError(new ForbiddenError('Token inválido: identificador do cliente não encontrado', 3003));
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
      this.logger.writeLog('error', 'JWT verification failed.', {
        traceId,
        errorMessage: error?.message,
        errorCode: error?.code,
      });

      if (error?.code === 'ERR_JWT_EXPIRED') {
        return getHttpError(new ForbiddenError('Token expirado', 3004));
      }
      if (error?.code === 'ERR_JWT_INVALID') {
        return getHttpError(new ForbiddenError('Token inválido', 3005));
      }
      if (error?.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
        const claimMessage = error?.claim === 'iss'
          ? 'Token inválido: issuer não corresponde'
          : error?.claim === 'aud'
          ? 'Token inválido: audience não corresponde'
          : `Token inválido: validação de claims falhou (${error?.claim || 'desconhecido'})`;
        
        return getHttpError(new ForbiddenError(claimMessage, 3006));
      }

      return getHttpError(new ForbiddenError('Não autorizado', 3007));
    }
  }
}
