#!/usr/bin/env tsx

/**
 * Module Generator CLI
 *
 * Generates a new module following the architecture patterns described in AGENTS.md.
 *
 * Usage:
 *   pnpm run generate:module <module-name>
 *   # or
 *   npx tsx scripts/generate-module.ts <module-name>
 *
 * Example:
 *   pnpm run generate:module user-profile
 *   pnpm run generate:module create-appointment
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`),
};

/**
 * Converts kebab-case to PascalCase
 * Example: "health-check" -> "HealthCheck"
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts kebab-case to camelCase
 * Example: "health-check" -> "healthCheck"
 */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Validates module name format
 */
function validateModuleName(name: string): boolean {
  const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  return kebabCaseRegex.test(name);
}

// --- Template generators ---

function generateInterfaceFile(moduleName: string): string {
  const pascalName = toPascalCase(moduleName);

  return `export interface I${pascalName} {
  run(params: ${pascalName}.Params): Promise<${pascalName}.Response>;
}

export namespace ${pascalName} {
  export type Params = {
    traceId: string;
    clientId?: number;
    // Add other parameters here...
  };

  export type Response = {
    // Define response structure here...
  };
}
`;
}

function generateServiceFile(moduleName: string): string {
  const pascalName = toPascalCase(moduleName);

  return `import { ILoggingManager } from '@/infra';
import { BaseService } from '@/modules/shared';

import { ${pascalName}, I${pascalName} } from '.';

export class ${pascalName}Service extends BaseService implements I${pascalName} {
  constructor(protected readonly logger: ILoggingManager) {
    super(logger);
  }

  async run(params: ${pascalName}.Params): Promise<${pascalName}.Response> {
    const { traceId } = params;
    this.traceId = traceId;

    this.log('debug', 'Starting processing...');

    // TODO: Implement business logic here

    this.log('debug', 'Processing completed.');

    return {} as ${pascalName}.Response;
  }
}
`;
}

function generateServiceFactoryFile(moduleName: string): string {
  const pascalName = toPascalCase(moduleName);

  return `import { makeLogging } from '@/infra';

import { I${pascalName}, ${pascalName}Service } from '.';

export const make${pascalName}Service = (): I${pascalName} => {
  return new ${pascalName}Service(makeLogging());
};
`;
}

function generateControllerFile(moduleName: string): string {
  const pascalName = toPascalCase(moduleName);
  const camelName = toCamelCase(moduleName);

  return `import { ok, getHttpError, Http } from '@/infra/http';
import { IController } from '@/modules/shared';

import { I${pascalName} } from '.';

type ${pascalName}Handler = () => I${pascalName};

export class ${pascalName}Controller implements IController {
  constructor(private readonly ${camelName}Service: ${pascalName}Handler) {}

  public async handle({ data, locals }: Http.IRequest): Promise<Http.IResponse> {
    try {
      const content = await this.${camelName}Service().run({
        ...data,
        clientId: locals?.client?.id,
        traceId: locals?.traceId,
      });

      return ok({ content });
    } catch (error: any) {
      return getHttpError(error);
    }
  }
}
`;
}

function generateControllerFactoryFile(moduleName: string): string {
  const pascalName = toPascalCase(moduleName);

  return `import { IController } from '@/modules/shared';

import { ${pascalName}Controller, make${pascalName}Service } from '.';

export const make${pascalName}Controller = (): IController => {
  return new ${pascalName}Controller(make${pascalName}Service);
};
`;
}

function generateIndexFile(moduleName: string): string {
  return `export * from './${moduleName}';
export * from './${moduleName}-service';
export * from './${moduleName}-controller';
export * from './${moduleName}-controller-factory';
export * from './${moduleName}-service-factory';
`;
}

function generateRouteFile(moduleName: string): string {
  const pascalName = toPascalCase(moduleName);

  return `import { Router } from 'express';

import { make${pascalName}Controller } from '@/modules/${moduleName}';
import { adaptRoute } from '@/routes/handlers';

export default (router: Router): void => {
  // TODO: Define HTTP method and route path
  router.get('/${moduleName}', adaptRoute(make${pascalName}Controller()));
};
`;
}

// --- Main execution ---

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    log.title('🚀 Module Generator CLI');
    console.log('Usage:');
    console.log('  pnpm run generate:module <module-name>');
    console.log('');
    console.log('Arguments:');
    console.log(
      '  module-name    Module name in kebab-case (e.g., user-profile, create-appointment)'
    );
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --with-route   Also generate a route file in src/routes/v1/');
    console.log('');
    console.log('Examples:');
    console.log('  pnpm run generate:module user-profile');
    console.log('  pnpm run generate:module create-appointment --with-route');
    process.exit(0);
  }

  const moduleName = args[0];
  const withRoute = args.includes('--with-route');

  // Validate module name
  if (!validateModuleName(moduleName)) {
    log.error(`Invalid module name: "${moduleName}"`);
    log.info('Module name must be in kebab-case (e.g., user-profile, create-appointment)');
    process.exit(1);
  }

  // Get paths
  const rootDir = path.resolve(import.meta.dirname, '..');
  const modulesDir = path.join(rootDir, 'src', 'modules');
  const moduleDir = path.join(modulesDir, moduleName);
  const routesDir = path.join(rootDir, 'src', 'routes', 'v1');

  // Check if module already exists
  if (fs.existsSync(moduleDir)) {
    log.error(`Module "${moduleName}" already exists at ${moduleDir}`);
    process.exit(1);
  }

  log.title(`🚀 Generating module: ${moduleName}`);

  // Create module directory
  fs.mkdirSync(moduleDir, { recursive: true });
  log.success(`Created directory: src/modules/${moduleName}/`);

  // Define files to create
  const files = [
    {
      name: `${moduleName}.ts`,
      content: generateInterfaceFile(moduleName),
      desc: 'Interface and types',
    },
    { name: `${moduleName}-service.ts`, content: generateServiceFile(moduleName), desc: 'Service' },
    {
      name: `${moduleName}-service-factory.ts`,
      content: generateServiceFactoryFile(moduleName),
      desc: 'Service factory',
    },
    {
      name: `${moduleName}-controller.ts`,
      content: generateControllerFile(moduleName),
      desc: 'Controller',
    },
    {
      name: `${moduleName}-controller-factory.ts`,
      content: generateControllerFactoryFile(moduleName),
      desc: 'Controller factory',
    },
    { name: 'index.ts', content: generateIndexFile(moduleName), desc: 'Index (exports)' },
  ];

  // Create module files
  for (const file of files) {
    const filePath = path.join(moduleDir, file.name);
    fs.writeFileSync(filePath, file.content, 'utf-8');
    log.success(`Created: ${file.name} (${file.desc})`);
  }

  // Create route file if requested
  if (withRoute) {
    const routeFileName = `${moduleName}-route.ts`;
    const routeFilePath = path.join(routesDir, routeFileName);

    if (fs.existsSync(routeFilePath)) {
      log.warn(`Route file already exists: src/routes/v1/${routeFileName}`);
    } else {
      fs.writeFileSync(routeFilePath, generateRouteFile(moduleName), 'utf-8');
      log.success(`Created: src/routes/v1/${routeFileName} (Route)`);
    }
  }

  // Print summary
  const pascalName = toPascalCase(moduleName);

  console.log('');
  log.title('📋 Summary');
  console.log(`Module "${moduleName}" created successfully!`);
  console.log('');
  console.log('Generated structure:');
  console.log(`  src/modules/${moduleName}/`);
  console.log(`  ├── index.ts`);
  console.log(`  ├── ${moduleName}.ts`);
  console.log(`  ├── ${moduleName}-service.ts`);
  console.log(`  ├── ${moduleName}-service-factory.ts`);
  console.log(`  ├── ${moduleName}-controller.ts`);
  console.log(`  └── ${moduleName}-controller-factory.ts`);

  if (withRoute) {
    console.log(`  src/routes/v1/${moduleName}-route.ts`);
  }

  console.log('');
  log.title('📝 Next steps');
  console.log(`1. Implement the business logic in ${moduleName}-service.ts`);
  console.log(`2. Define the Params and Response types in ${moduleName}.ts`);
  console.log(`3. Create/update the route in src/routes/v1/`);
  console.log('');
  console.log('Usage in route:');
  console.log(`  import { make${pascalName}Controller } from '@/modules/${moduleName}';`);
  console.log(`  router.get('/${moduleName}', adaptRoute(make${pascalName}Controller()));`);
  console.log('');
}

main().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
