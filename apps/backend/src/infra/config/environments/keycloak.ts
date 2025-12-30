import env from 'env-var';

const KeycloakEnv = {
  keycloakBaseUrl: env.get('KEYCLOAK_BASE_URL').required().asString(),
  keycloakRealm: env.get('KEYCLOAK_REALM').required().asString(),
  keycloakAudience: env.get('KEYCLOAK_AUDIENCE').required().asString(),
};

export { KeycloakEnv };
