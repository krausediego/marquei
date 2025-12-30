import '@/infra/config/dotenv';

import { makeLogging, ApplicationEnv as env } from '@/infra';

import { App } from './app';

class ServerSetup {
  private logger = makeLogging();

  private app!: App;

  public async start() {
    this.logger.info('Initializing setup of services...');
    this.app = (await import('./app')).default;
    this.app.listen(env.port);
  }

  public async stop() {
    this.logger.debug('Initializing graceful shutdown...');
    await this.app.disconnect();
    this.logger.debug('Finished graceful shutdown...');
    process.exitCode = 1;
  }
}

const serviceSetup = new ServerSetup();
serviceSetup.start();

process.on('SIGTERM', async () => {
  await serviceSetup.stop();
});
