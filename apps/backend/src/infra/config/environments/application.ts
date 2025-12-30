import env from 'env-var';

const ApplicationEnv = {
  mode: env.get('NODE_ENV').default('development').asString(),
  port: env.get('PORT').default('3000').asPortNumber(),
};

export { ApplicationEnv };
