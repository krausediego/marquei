import express from 'express';
import { globSync } from 'fs';
import 'express-async-errors';
import { Server } from 'http';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ILoggingManager, ApplicationEnv as env, makeLogging } from '@/infra';
import { trace } from '@/routes/middlewares';

export class App {
  public readonly app: express.Express;

  private server!: Server;

  constructor(private readonly logger: ILoggingManager) {
    this.app = express();
  }

  getApp(): express.Express {
    return this.app;
  }

  setupEnvironment(): this {
    this.app.use(express.json());
    return this;
  }

  errorHandler(
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ): express.Response {
    if (env.mode !== 'development' && !!(error as any)?.statusCode) {
      return res.status((error as any)?.statusCode ?? 400).json({
        error: error?.message ?? 'unknown',
      });
    }
    this.logger.error({ error }, 'Internal Server Error');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  setupRoutes(): this {
    const router = express.Router();
    this.app.use(trace);

    this.app.get('/', (_, res) => res.status(200).send('ok'));
    router.get('/', (_, res) => res.status(200).send('ok'));

    const routesPathPattern = path.resolve(__dirname, 'routes/v*');
    const versionFolders = globSync(routesPathPattern);

    versionFolders.forEach((versionPath) => {
      const version = path.basename(versionPath);
      const versionRouter = express.Router();

      const routeFiles = globSync(`${versionPath}/*.{js,ts}`, {
        exclude: ['**/*.map'],
      });

      routeFiles.forEach(async (file) => {
        const route = await import(pathToFileURL(file).href);
        if (route?.default) {
          route.default(versionRouter);
        }
      });

      this.app.use(`/api/${version}`, versionRouter);
    });

    this.app.use(this.errorHandler.bind(this));
    return this;
  }

  disconnect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.logger.debug('Server shutdown...');
        resolve(true);
      });
    });
  }

  listen(port: number): void {
    this.server = this.app.listen(port, () => {
      this.logger.info(`⚡️ App listen on port ${port}.`);
    });
  }
}

export default new App(makeLogging()).setupEnvironment().setupRoutes();
