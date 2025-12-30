# AGENTS.md - Backend Architecture Guide

This document describes the conventions, patterns, and practices to follow when developing new modules, features, or updates in the backend.

---

## 📦 Shared Package (Monorepo) - IMPORTANT

**All common types and Yup validation schemas MUST be placed in the shared package** (`packages/shared/`) for use across all applications (backend, web, mobile).

### What Should Be in the Shared Package

- **API Response Types**: Types returned by API endpoints
- **Request Payload Types**: Types for request bodies (create, update payloads)
- **Entity Types**: Common entity definitions (User, Appointment, etc.)
- **Route Parameter Types**: Types for route params and query strings
- **Yup Validation Schemas**: All form/request validation schemas
- **Enums and Constants**: Shared enums (status, roles, etc.)

### Structure

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── index.ts
│   │   ├── user.ts              # User, CreateUserPayload, UpdateUserPayload
│   │   ├── appointment.ts       # Appointment, CreateAppointmentPayload
│   │   └── common.ts            # PaginatedResponse, ApiResponse, etc.
│   ├── schemas/
│   │   ├── index.ts
│   │   ├── user-schema.ts       # createUserSchema, updateUserSchema
│   │   └── appointment-schema.ts
│   ├── enums/
│   │   ├── index.ts
│   │   └── status.ts            # AppointmentStatus, UserRole, etc.
│   └── index.ts
└── package.json
```

### Usage in Backend

```typescript
import { User, CreateUserPayload, PaginatedResponse } from '@marquei/shared/types';
import { createUserSchema } from '@marquei/shared/schemas';
import { UserRole } from '@marquei/shared/enums';
```

> **Note**: Module-specific internal types (like service params with traceId) remain in the module itself. Only types shared across apps go in the shared package.

---

## 🌐 Language Guidelines

- **Code comments**: Always in **English**
- **Log messages**: Always in **English**
- **Variable/function names**: Always in **English**
- **Client responses (errors, messages)**: Always in **Brazilian Portuguese (pt-BR)**

```typescript
// ✅ Correct
this.log('debug', 'Starting user validation.');
throw new BadRequestError('Usuário não encontrado', 2001);

// ❌ Incorrect
this.log('debug', 'Iniciando validação do usuário.');
throw new BadRequestError('User not found', 2001);
```

---

## 📁 Folder Structure

```
src/
├── infra/                    # Infrastructure (config, database, http, logging, hash)
│   ├── config/               # Configuration and environment variables
│   ├── database/             # Database connection and client (Prisma)
│   ├── http/                 # HTTP types, response helpers, and custom errors
│   ├── logging/              # Logging system (Pino)
│   └── hash/                 # Hash generators
├── modules/                  # Domain/business modules
│   ├── shared/               # Shared classes and interfaces (BaseService, IController)
│   └── [module-name]/        # Specific module
├── routes/                   # HTTP routes
│   ├── handlers/             # Adapters (adaptRoute, adaptMiddleware)
│   ├── middlewares/          # Application middlewares
│   └── v1/                   # Versioned routes
└── helpers/                  # Utility functions
```

---

## 🏗️ Module Architecture

Each module should follow the structure below:

```
modules/[module-name]/
├── index.ts                           # Exports all module files
├── [name].ts                          # Interface and namespace with types (Params, Response)
├── [name]-service.ts                  # Service implementing business logic
├── [name]-service-factory.ts          # Factory that instantiates the service
├── [name]-controller.ts               # Controller that orchestrates the request
└── [name]-controller-factory.ts       # Factory that instantiates the controller
```

### Implementation Example

#### 1. Interface and Types (`[name].ts`)

```typescript
export interface IModuleName {
  run(params: ModuleName.Params): Promise<ModuleName.Response>;
}

export namespace ModuleName {
  export type Params = {
    traceId: string;
    clientId?: number;
    // other parameters...
  };

  export type Response = {
    // response structure...
  };
}
```

#### 2. Service (`[name]-service.ts`)

```typescript
import { ILoggingManager } from '@/infra';
import { BaseService } from '@/modules/shared';

import { ModuleName, IModuleName } from '.';

export class ModuleNameService extends BaseService implements IModuleName {
  constructor(protected readonly logger: ILoggingManager) {
    super(logger);
  }

  async run(params: ModuleName.Params): Promise<ModuleName.Response> {
    const { traceId } = params;
    this.traceId = traceId;

    this.log('debug', 'Starting processing...');

    // Business logic here...

    this.log('debug', 'Processing completed.');

    return result;
  }
}
```

#### 3. Service Factory (`[name]-service-factory.ts`)

```typescript
import { makeLogging } from '@/infra';

import { IModuleName, ModuleNameService } from '.';

export const makeModuleNameService = (): IModuleName => {
  return new ModuleNameService(makeLogging());
};
```

#### 4. Controller (`[name]-controller.ts`)

```typescript
import { ok, getHttpError, Http } from '@/infra/http';
import { IController } from '@/modules/shared';

import { IModuleName } from '.';

type ModuleNameHandler = () => IModuleName;

export class ModuleNameController implements IController {
  constructor(private readonly moduleNameService: ModuleNameHandler) {}

  public async handle({ data, locals }: Http.IRequest): Promise<Http.IResponse> {
    try {
      const content = await this.moduleNameService().run({
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
```

#### 5. Controller Factory (`[name]-controller-factory.ts`)

```typescript
import { IController } from '@/modules/shared';

import { ModuleNameController, makeModuleNameService } from '.';

export const makeModuleNameController = (): IController => {
  return new ModuleNameController(makeModuleNameService);
};
```

#### 6. Index (`index.ts`)

```typescript
export * from './[name]';
export * from './[name]-service';
export * from './[name]-controller';
export * from './[name]-controller-factory';
export * from './[name]-service-factory';
```

---

## 🛣️ Defining Routes

Routes are defined in `src/routes/v1/` (or corresponding version):

```typescript
import { Router } from 'express';

import { makeModuleNameController } from '@/modules/module-name';
import { adaptRoute } from '@/routes/handlers';

export default (router: Router): void => {
  router.get('/route-name', adaptRoute(makeModuleNameController()));
  router.post('/route-name', adaptRoute(makeModuleNameController()));
};
```

---

## ⚠️ Custom Errors

Use custom errors located in `@/infra/http/errors`:

```typescript
import { BadRequestError, NotFoundError, ForbiddenError, InternalServerError } from '@/infra';

// Usage examples (messages in Portuguese for client responses):
throw new BadRequestError('Requisição inválida', 1001);
throw new NotFoundError('Recurso não encontrado', 1002);
throw new ForbiddenError('Acesso negado', 1003);
throw new InternalServerError('Erro interno do servidor', 1004);
```

### Custom Error Structure

```typescript
export class CustomError extends Error {
  public readonly statusCode = 400; // HTTP status code

  public readonly code;

  constructor(message: string, code?: number) {
    super('Custom Error');
    this.name = 'CustomError';
    this.message = message;
    this.code = code;
  }
}
```

---

## 📝 Conventions and Best Practices

### Clean Code & SOLID

1. **Single Responsibility (SRP)**: Each class/function should have a single responsibility.
2. **Open/Closed (OCP)**: Classes open for extension, closed for modification.
3. **Liskov Substitution (LSP)**: Subtypes must be substitutable for their base types.
4. **Interface Segregation (ISP)**: Specific interfaces are better than a general interface.
5. **Dependency Inversion (DIP)**: Depend on abstractions (interfaces), not concrete implementations.

### Naming Conventions

- **Files**: `kebab-case` (e.g., `health-check-service.ts`)
- **Classes**: `PascalCase` (e.g., `HealthCheckService`)
- **Interfaces**: Prefix `I` (e.g., `IHealthCheck`, `IController`)
- **Factories**: Prefix `make` (e.g., `makeHealthCheckService`)
- **Namespaces**: `PascalCase` for types (e.g., `HealthCheck.Params`)

### Imports

Always use the `@/` alias for internal imports:

```typescript
// ✅ Correct
import { makeLogging } from '@/infra';
import { BaseService } from '@/modules/shared';

// ❌ Incorrect
import { makeLogging } from '../../infra';
import { BaseService } from '../shared';
```

### Exports

Every module/folder must have an `index.ts` that exports its files:

```typescript
// index.ts
export * from './file-1';
export * from './file-2';
export * from './file-3';
```

---

## 📋 Logging

### Log Levels

- `debug`: Detailed information for debugging (development)
- `info`: Normal system events
- `warn`: Potentially problematic situations
- `error`: Errors that do not prevent operation
- `fatal`: Critical errors that prevent operation

### Usage in Service

Use the `this.log()` method inherited from `BaseService`:

```typescript
// Simple log
this.log('debug', 'Starting data validation.');

// Log with additional object
this.log('info', 'User created successfully.', { userId: user.id });

// Error log
this.log('error', 'Failed to process request.', { error: error.message });
```

### Logging Guidelines

1. **Add debug logs** at each significant processing step.
2. **Avoid redundant logs** (e.g., don't log entry and exit of trivial functions).
3. **Include relevant context** in logs (IDs, important data).
4. **Use the appropriate level** for each situation.

```typescript
async run(params: ModuleName.Params): Promise<ModuleName.Response> {
  const { traceId, userId } = params;
  this.traceId = traceId;

  this.log('debug', 'Starting user search.', { userId });

  const user = await this.userRepository.findById(userId);

  if (!user) {
    this.log('warn', 'User not found.', { userId });
    throw new NotFoundError('Usuário não encontrado', 2001); // Portuguese for client
  }

  this.log('debug', 'User found. Processing data.');

  // ... processing ...

  this.log('info', 'Processing completed successfully.', { userId });

  return result;
}
```

---

## 🔒 Sensitive Data in Logs

When logging objects that contain sensitive data (passwords, tokens, personal information, etc.), **always** use the `obfuscateInformationInObjectDynamic` helper to mask sensitive fields.

### Import

```typescript
import { obfuscateInformationInObjectDynamic } from '@/helpers';
```

### Usage

```typescript
import { obfuscateInformationInObjectDynamic } from '@/helpers';

// Example: logging user data with sensitive fields
const userData = {
  id: 1,
  email: 'user@example.com',
  password: 'secret123',
  cpf: '123.456.789-00',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

// Obfuscate sensitive fields before logging
const safeData = obfuscateInformationInObjectDynamic(userData, ['password', 'cpf', 'token']);

this.log('debug', 'User data received.', safeData);
// Output: { id: 1, email: 'user@example.com', password: '*********', cpf: '**************', token: '****...' }
```

### Common Sensitive Fields to Obfuscate

- `password`, `senha`
- `token`, `accessToken`, `refreshToken`
- `cpf`, `cnpj`, `rg`
- `creditCard`, `cardNumber`, `cvv`
- `secret`, `apiKey`
- `pin`, `otp`

### Full Example in Service

```typescript
async run(params: CreateUser.Params): Promise<CreateUser.Response> {
  const { traceId, userData } = params;
  this.traceId = traceId;

  // Log with obfuscated sensitive data
  const safeUserData = obfuscateInformationInObjectDynamic(userData, ['password', 'cpf']);
  this.log('debug', 'Creating new user.', { user: safeUserData });

  const user = await this.userRepository.create(userData);

  this.log('info', 'User created successfully.', { userId: user.id });

  return user;
}
```

---

## 💬 Comments

Add comments **only in complex code sections** or that need additional explanation:

```typescript
// ✅ Good: Explains complex logic
// Calculates progressive discount based on quantity:
// - Up to 10 items: no discount
// - 11-50 items: 5% discount
// - 51+ items: 10% discount
const discount = quantity <= 10 ? 0 : quantity <= 50 ? 0.05 : 0.1;

// ❌ Bad: Obvious/redundant comment
// Increments the counter
counter++;
```

---

## 🔄 HTTP Response Helpers

Use the helpers available in `@/infra/http`:

```typescript
import { ok, created, noContent, getHttpError } from '@/infra/http';

// Success (200)
return ok({ content: data });

// Created (201)
return created({ content: newResource });

// No Content (204)
return noContent();

// Error
return getHttpError(error);
```

---

## 🗄️ Database (Prisma)

The Prisma client is available in `@/infra/database`:

```typescript
import { prisma } from '@/infra/database';

// Usage
const users = await prisma.user.findMany();
```

---

## ✅ Checklist for New Modules

- [ ] Create module folder in `src/modules/[module-name]/`
- [ ] Create interface and namespace with types (`[name].ts`)
- [ ] Create service extending `BaseService` (`[name]-service.ts`)
- [ ] Create service factory (`[name]-service-factory.ts`)
- [ ] Create controller implementing `IController` (`[name]-controller.ts`)
- [ ] Create controller factory (`[name]-controller-factory.ts`)
- [ ] Create `index.ts` exporting all files
- [ ] Create route in `src/routes/v1/`
- [ ] Add debug logs at each step
- [ ] Use custom errors when necessary (messages in Portuguese)
- [ ] Use `@/` alias in all imports
- [ ] Obfuscate sensitive data in logs using `obfuscateInformationInObjectDynamic`
- [ ] Follow established naming conventions
