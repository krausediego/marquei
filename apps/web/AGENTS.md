# AGENTS.md - Frontend Architecture Guide

This document describes the conventions, patterns, and practices to follow when developing new features, components, or updates in the frontend.

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

### Usage in Frontend

```typescript
import { User, CreateUserPayload, PaginatedResponse } from '@marquei/shared/types';
import { createUserSchema, CreateUserFormData } from '@marquei/shared/schemas';
import { UserRole, AppointmentStatus } from '@marquei/shared/enums';
```

### Example Types (`packages/shared/src/types/user.ts`)

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
}
```

### Example Schemas (`packages/shared/src/schemas/user-schema.ts`)

```typescript
import * as yup from 'yup';

export const createUserSchema = yup.object({
  name: yup.string().required('Nome é obrigatório').min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: yup.string().required('E-mail é obrigatório').email('E-mail inválido'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export type CreateUserFormData = yup.InferType<typeof createUserSchema>;
```

> **Note**: Route-specific constants (like query keys) remain in the route's `_constants/` folder. Only types/schemas shared across apps go in the shared package.

---

## 🌐 Language Guidelines

- **Code comments**: Always in **English**
- **Variable/function names**: Always in **English**
- **UI labels and messages**: Always in **Brazilian Portuguese (pt-BR)**

```typescript
// ✅ Correct
const handleUserSubmit = () => { ... }  // English function name
<Button>Criar conta</Button>  // Portuguese UI label

// ❌ Incorrect
const handleEnvioUsuario = () => { ... }  // Portuguese function name
<Button>Create account</Button>  // English UI label
```

---

## 📁 Folder Structure

```
src/
├── api/                      # API configuration (axios instance)
├── assets/                   # Static assets (images, icons, fonts)
├── auth/                     # Authentication (Keycloak)
├── components/               # Global reusable UI components
│   ├── ui/                   # shadcn/ui components
│   └── [component-name]/     # Custom global components
├── hooks/                    # Global custom hooks (shared logic)
├── layouts/                  # Layout components (Header, Sidebar, etc.)
├── lib/                      # Utility functions and helpers
├── routes/                   # TanStack Router route definitions
│   └── [route-name]/         # Route with its specific resources
│       ├── -components/      # Route-specific components
│       ├── -hooks/           # Route-specific hooks (page logic)
│       ├── -skeletons/       # Route-specific skeleton components
│       └── -constants/       # Route-specific constants (query keys, etc.)
├── services/                 # API service functions
└── styles/                   # Global styles

packages/
└── shared/                   # Shared package (monorepo)
    ├── types/                # Shared TypeScript types
    └── schemas/              # Shared Yup validation schemas
```

---

## 🏗️ Architecture Principles

### Separation of Concerns

**UI components should be "dumb"** - they receive data via props and emit events. All business logic should be abstracted into custom hooks.

```
┌─────────────────────────────────────────────────────────┐
│                      Route Component                     │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Custom Hook   │───▶│      UI Components          │ │
│  │  (Logic Layer)  │    │  (Presentation Layer)       │ │
│  └────────┬────────┘    └─────────────────────────────┘ │
│           │                                              │
│  ┌────────▼────────┐    ┌─────────────────────────────┐ │
│  │    Services     │    │   nuqs (URL State)          │ │
│  │  (API Layer)    │    │   (HTTP State Management)   │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Route Structure (TanStack Router)

Each route/page should follow this structure:

```
routes/[route-name]/
├── index.tsx                     # Route component (exports the page)
├── route.tsx                     # TanStack Router route definition
├── -constants/                   # Route-specific constants (prefixed with -)
│   ├── query-keys.ts             # Query keys for this route
│   └── index.ts
├── -hooks/                       # Route-specific hooks (prefixed with -)
│   ├── use-[route-name].ts       # Main hook with page logic
│   └── index.ts
├── -components/                  # Route-specific components (prefixed with -)
│   ├── [component-name].tsx
│   └── index.ts
└── -skeletons/                   # Route-specific skeleton components (prefixed with -)
    ├── [skeleton-name].tsx
    └── index.ts
```

> **Note**: The `-` prefix in `-hooks`, `-components`, `-skeletons`, and `-constants` indicates these folders are route-specific and not routes themselves (TanStack Router convention).

---

## 🔑 Route-specific Query Keys

Query keys should be defined within the context of each route where they are used:

### Structure (`routes/users/-constants/query-keys.ts`)

```typescript
export const usersQueryKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  list: (filters: Record<string, unknown>) => ['users', 'list', filters] as const,
} as const;
```

### Multiple Entities in Same Route (`routes/appointments/-constants/query-keys.ts`)

```typescript
export const appointmentsQueryKeys = {
  all: ['appointments'] as const,
  detail: (id: string) => ['appointments', id] as const,
  byUser: (userId: string) => ['appointments', 'user', userId] as const,
  byDate: (date: string) => ['appointments', 'date', date] as const,
} as const;

// If needed, related entities can be in the same file
export const servicesQueryKeys = {
  all: ['services'] as const,
  detail: (id: string) => ['services', id] as const,
} as const;
```

### Index Export (`routes/users/-constants/index.ts`)

```typescript
export * from './query-keys';
```

### Usage in Route Hooks

```typescript
// routes/users/-hooks/use-users-page.ts
import { usersQueryKeys } from '../-constants';

useQuery({
  queryKey: usersQueryKeys.all,
  queryFn: userService.getAll,
});

useQuery({
  queryKey: usersQueryKeys.detail(userId),
  queryFn: () => userService.getById(userId),
});
```

---

## 💀 Route-specific Skeleton Components

Skeletons should be defined within the context of each route where they are used:

### Structure

```
routes/users/-skeletons/
├── user-card-skeleton.tsx
├── user-list-skeleton.tsx
├── user-table-skeleton.tsx
└── index.ts
```

### Card Skeleton (`routes/users/-skeletons/user-card-skeleton.tsx`)

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const UserCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
  </Card>
);
```

### List Skeleton (`routes/users/-skeletons/user-list-skeleton.tsx`)

```tsx
import { UserCardSkeleton } from './user-card-skeleton';

export const UserListSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <UserCardSkeleton key={i} />
    ))}
  </div>
);
```

### Table Skeleton (`routes/users/-skeletons/user-table-skeleton.tsx`)

```tsx
import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const UserTableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps) => (
  <div className="rounded-md border">
    <div className="border-b p-4">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b p-4 last:border-0">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      </div>
    ))}
  </div>
);
```

### Page Skeleton (`routes/users/-skeletons/users-page-skeleton.tsx`)

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import { UserListSkeleton } from './user-list-skeleton';

export const UsersPageSkeleton = () => (
  <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-10 w-full sm:w-64" />
    <UserListSkeleton />
  </div>
);
```

### Index Export (`routes/users/-skeletons/index.ts`)

```typescript
export * from './user-card-skeleton';
export * from './user-list-skeleton';
export * from './user-table-skeleton';
export * from './users-page-skeleton';
```

### Usage in Route Component

```tsx
// routes/users/index.tsx
import { useUsersPage } from './-hooks';
import { UserList } from './-components';
import { UsersPageSkeleton } from './-skeletons';

export const UsersPage = () => {
  const { users, isLoading } = useUsersPage();

  if (isLoading) {
    return <UsersPageSkeleton />;
  }

  return (
    // ... actual content
  );
};
```

---

## 🛣️ TanStack Router

### Router Setup (`main.tsx`)

```tsx
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Route Definition (`routes/users/route.tsx`)

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from './index';

export const Route = createFileRoute('/users')({
  component: UsersPage,
});
```

### Navigation

```tsx
import { Link, useNavigate } from '@tanstack/react-router';

// Declarative navigation
<Link to="/users/$userId" params={{ userId: '123' }}>
  Ver usuário
</Link>;

// Programmatic navigation
const navigate = useNavigate();
navigate({ to: '/users/$userId', params: { userId: '123' } });
```

---

## 🔗 URL State Management (nuqs)

Use `nuqs` for managing URL query parameters as state:

### Setup

```tsx
import { NuqsAdapter } from 'nuqs/adapters/react';

// In your root layout or provider
<NuqsAdapter>
  <App />
</NuqsAdapter>;
```

### Usage in Hooks

```typescript
import { useQueryState, parseAsString, parseAsInteger, parseAsArrayOf } from 'nuqs';

export const useUsersFilters = () => {
  // Single value
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));

  // Integer value
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  // Array value
  const [status, setStatus] = useQueryState(
    'status',
    parseAsArrayOf(parseAsString).withDefault([])
  );

  return {
    search,
    setSearch,
    page,
    setPage,
    status,
    setStatus,
  };
};
```

### Full Example with TanStack Query

```typescript
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { usersQueryKeys } from '../-constants';

export const useUsersPage = () => {
  // URL state with nuqs
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  // Filters object for query key
  const filters = { search, page };

  // TanStack Query with URL params
  const usersQuery = useQuery({
    queryKey: usersQueryKeys.list(filters),
    queryFn: () => userService.getAll(filters),
  });

  return {
    // Data
    users: usersQuery.data?.items ?? [],
    totalPages: usersQuery.data?.totalPages ?? 0,
    isLoading: usersQuery.isLoading,

    // URL State
    search,
    setSearch,
    page,
    setPage,
  };
};
```

---

## 🔄 TanStack Query

### Setup (`main.tsx`)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});
```

### Optimistic Updates (Preferred)

**Always prefer updating local cache** instead of just invalidating queries:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersQueryKeys } from '../-constants';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      userService.update(id, data),

    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: usersQueryKeys.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(usersQueryKeys.detail(id));

      // Optimistically update cache
      queryClient.setQueryData<User>(usersQueryKeys.detail(id), (old) =>
        old ? { ...old, ...data } : old
      );

      // Return context with snapshot
      return { previousUser };
    },

    // Rollback on error
    onError: (_err, { id }, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(usersQueryKeys.detail(id), context.previousUser);
      }
    },

    // Refetch after success (optional, for server confirmation)
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(id) });
    },
  });
};
```

### Adding to List Cache

```typescript
import { usersQueryKeys } from '../-constants';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => userService.create(data),

    onSuccess: (newUser) => {
      // Add new user to the list cache
      queryClient.setQueryData<User[]>(usersQueryKeys.all, (old) =>
        old ? [...old, newUser] : [newUser]
      );
    },
  });
};
```

### Removing from List Cache

```typescript
import { usersQueryKeys } from '../-constants';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: usersQueryKeys.all });

      const previousUsers = queryClient.getQueryData<User[]>(usersQueryKeys.all);

      // Optimistically remove from cache
      queryClient.setQueryData<User[]>(usersQueryKeys.all, (old) =>
        old ? old.filter((user) => user.id !== id) : []
      );

      return { previousUsers };
    },

    onError: (_err, _id, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(usersQueryKeys.all, context.previousUsers);
      }
    },
  });
};
```

---

## 📦 Complete Implementation Example

### Route Folder Structure

```
routes/users/
├── index.tsx                     # Main page component
├── route.tsx                     # TanStack Router route definition
├── -constants/
│   ├── query-keys.ts             # Users query keys
│   └── index.ts
├── -hooks/
│   ├── use-users-page.ts         # Page logic hook
│   └── index.ts
├── -components/
│   ├── user-list.tsx
│   ├── user-card.tsx
│   ├── create-user-modal.tsx
│   └── index.ts
└── -skeletons/
    ├── user-card-skeleton.tsx
    ├── user-list-skeleton.tsx
    ├── users-page-skeleton.tsx
    └── index.ts
```

### 1. Constants (`routes/users/-constants/query-keys.ts`)

```typescript
export const usersQueryKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  list: (filters: Record<string, unknown>) => ['users', 'list', filters] as const,
} as const;
```

### 2. Service (`services/user-service.ts`)

```typescript
import { api } from '@/api/axios';
import { User, CreateUserPayload, UpdateUserPayload } from '@marquei/shared/types';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  getAll: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<{ content: PaginatedResponse<User> }>('/api/v1/users', {
      params: filters,
    });
    return data.content;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<{ content: User }>(`/api/v1/users/${id}`);
    return data.content;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await api.post<{ content: User }>('/api/v1/users', payload);
    return data.content;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await api.put<{ content: User }>(`/api/v1/users/${id}`, payload);
    return data.content;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/users/${id}`);
  },
};
```

### 3. Route Hook (`routes/users/-hooks/use-users-page.ts`)

```typescript
import { useState } from 'react';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersQueryKeys } from '../-constants';
import { userService } from '@/services/user-service';
import { User, CreateUserPayload } from '@marquei/shared/types';

export const useUsersPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // URL state
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const filters = { search, page };

  // Query
  const usersQuery = useQuery({
    queryKey: usersQueryKeys.list(filters),
    queryFn: () => userService.getAll(filters),
  });

  // Mutations with optimistic updates
  const createMutation = useMutation({
    mutationFn: (data: CreateUserPayload) => userService.create(data),
    onSuccess: (newUser) => {
      queryClient.setQueryData<{ items: User[] }>(usersQueryKeys.list(filters), (old) =>
        old ? { ...old, items: [...old.items, newUser] } : { items: [newUser] }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: usersQueryKeys.list(filters) });
      const previous = queryClient.getQueryData<{ items: User[] }>(usersQueryKeys.list(filters));

      queryClient.setQueryData<{ items: User[] }>(usersQueryKeys.list(filters), (old) =>
        old ? { ...old, items: old.items.filter((u) => u.id !== id) } : { items: [] }
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(usersQueryKeys.list(filters), context.previous);
      }
    },
  });

  // Handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateUser = async (data: CreateUserPayload) => {
    await createMutation.mutateAsync(data);
    handleCloseModal();
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return {
    // Data
    users: usersQuery.data?.items ?? [],
    totalPages: usersQuery.data?.totalPages ?? 0,
    isLoading: usersQuery.isLoading,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Modal
    isModalOpen,
    handleOpenModal,
    handleCloseModal,

    // Actions
    handleCreateUser,
    handleDeleteUser,

    // Filters
    search,
    handleSearch,
    page,
    setPage,
  };
};
```

### 4. Route Component (`routes/users/index.tsx`)

```tsx
import { useUsersPage } from './-hooks';
import { UserList, CreateUserModal } from './-components';
import { UsersPageSkeleton } from './-skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const UsersPage = () => {
  const {
    users,
    totalPages,
    isLoading,
    isCreating,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    handleCreateUser,
    handleDeleteUser,
    search,
    handleSearch,
    page,
    setPage,
  } = useUsersPage();

  if (isLoading) {
    return <UsersPageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button onClick={handleOpenModal}>Novo usuário</Button>
      </div>

      <Input
        placeholder="Buscar usuários..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full sm:w-64"
      />

      <UserList users={users} onDelete={handleDeleteUser} />

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Anterior
        </Button>
        <span className="flex items-center px-4">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </Button>
      </div>

      <CreateUserModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateUser}
        isLoading={isCreating}
      />
    </div>
  );
};
```

---

## 🎨 Design System (shadcn/ui)

### Installation

```bash
npx shadcn@latest init
npx shadcn@latest add button card input label dialog skeleton table
```

### Component Usage

Always use shadcn/ui components for consistency:

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
```

---

## 📱 Responsive Design (Mobile First)

### Breakpoints

Follow Tailwind CSS breakpoints (mobile first approach):

| Prefix | Min Width | CSS                          |
| ------ | --------- | ---------------------------- |
| (none) | 0px       | Default (mobile)             |
| `sm`   | 640px     | `@media (min-width: 640px)`  |
| `md`   | 768px     | `@media (min-width: 768px)`  |
| `lg`   | 1024px    | `@media (min-width: 1024px)` |
| `xl`   | 1280px    | `@media (min-width: 1280px)` |
| `2xl`  | 1536px    | `@media (min-width: 1536px)` |

### Mobile First Pattern

**Always start with mobile styles, then add larger screen overrides:**

```tsx
// ✅ Correct: Mobile first
<div className="flex flex-col gap-2 md:flex-row md:gap-4 lg:gap-6">
  <div className="w-full md:w-1/2 lg:w-1/3">Content</div>
</div>

// ❌ Incorrect: Desktop first
<div className="flex flex-row gap-6 sm:flex-col sm:gap-2">
  <div className="w-1/3 sm:w-full">Content</div>
</div>
```

---

## 📝 Conventions and Best Practices

### Naming Conventions

- **Files**: `kebab-case` (e.g., `user-list.tsx`, `use-users.ts`)
- **Components**: `PascalCase` (e.g., `UserList`, `CreateUserModal`)
- **Hooks**: Prefix `use` (e.g., `useUsers`, `useUsersPage`)
- **Services**: Suffix `Service` (e.g., `userService`)
- **Types/Interfaces**: `PascalCase` (e.g., `User`, `CreateUserPayload`)
- **Query Keys**: Suffix `QueryKeys` (e.g., `usersQueryKeys`)
- **Route folders with specific resources**: Prefix `-` (e.g., `-hooks`, `-components`, `-skeletons`, `-constants`)

### Imports

Always use the `@/` alias for internal imports:

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user-service';
import { User } from '@marquei/shared/types';
import { createUserSchema } from '@marquei/shared/schemas';

// Route-relative imports for route-specific resources
import { usersQueryKeys } from '../-constants';
import { useUsersPage } from './-hooks';
import { UsersPageSkeleton } from './-skeletons';

// ❌ Incorrect
import { Button } from '../../../components/ui/button';
```

---

## 💬 Comments

Add comments **only in complex code sections**:

```typescript
// ✅ Good: Explains complex logic
// Debounce search to avoid excessive API calls while user is typing
const debouncedSearch = useMemo(() => debounce((term: string) => setSearchTerm(term), 300), []);

// ❌ Bad: Obvious comment
// Sets the user name
setUserName(name);
```

---

## ✅ Checklist for New Features

- [ ] Create route folder in `routes/[route-name]/`
- [ ] Create route-specific constants in `routes/[route-name]/-constants/`
  - [ ] Add query keys to `query-keys.ts`
- [ ] Create route-specific hooks in `routes/[route-name]/-hooks/`
- [ ] Create route-specific components in `routes/[route-name]/-components/`
- [ ] Create route-specific skeletons in `routes/[route-name]/-skeletons/`
- [ ] Create service in `services/[feature]-service.ts`
- [ ] Add types to `packages/shared/src/types/`
- [ ] Add Yup schemas to `packages/shared/src/schemas/`
- [ ] Use nuqs for URL state management
- [ ] Implement optimistic updates in mutations
- [ ] Ensure responsive design (mobile first)
- [ ] Use `@/` alias for global imports
- [ ] Use relative imports for route-specific resources
- [ ] Follow naming conventions
