# AGENTS.md - Mobile Architecture Guide

This document describes the conventions, patterns, and practices to follow when developing new features, screens, or updates in the mobile app.

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

### Usage in Mobile

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

> **Note**: Screen-specific constants (like query keys) remain in the screen's `_constants/` folder. Only types/schemas shared across apps go in the shared package.

---

## 🌐 Language Guidelines

- **Code comments**: Always in **English**
- **Variable/function names**: Always in **English**
- **UI labels and messages**: Always in **Brazilian Portuguese (pt-BR)**

```typescript
// ✅ Correct
const handleUserSubmit = () => { ... }  // English function name
<Text>Criar conta</Text>  // Portuguese UI label

// ❌ Incorrect
const handleEnvioUsuario = () => { ... }  // Portuguese function name
<Text>Create account</Text>  // English UI label
```

---

## 📁 Folder Structure

```
src/
├── api/                      # API configuration (axios instance)
├── assets/                   # Static assets (images, icons, fonts)
├── auth/                     # Authentication (Keycloak)
├── components/               # Global reusable UI components
│   └── [component-name]/     # Custom global components
├── hooks/                    # Global custom hooks (shared logic)
├── lib/                      # Utility functions and helpers
├── app/                      # Expo Router screens (file-based routing)
│   ├── (tabs)/               # Tab navigator group
│   ├── (auth)/               # Auth screens group
│   └── [screen-name]/        # Screen with its specific resources
│       ├── _components/      # Screen-specific components
│       ├── _hooks/           # Screen-specific hooks
│       ├── _skeletons/       # Screen-specific skeleton components
│       └── _constants/       # Screen-specific constants (query keys, etc.)
├── services/                 # API service functions
├── theme/                    # Theme configuration (colors, spacing, typography)
└── utils/                    # Utility functions

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
│                      Screen Component                    │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Custom Hook   │───▶│      UI Components          │ │
│  │  (Logic Layer)  │    │  (Presentation Layer)       │ │
│  └────────┬────────┘    └─────────────────────────────┘ │
│           │                                              │
│  ┌────────▼────────┐    ┌─────────────────────────────┐ │
│  │    Services     │    │   URL State (expo-router)   │ │
│  │  (API Layer)    │    │   (Search Params)           │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Screen Structure (Expo Router)

Each screen should follow this structure:

```
app/[screen-name]/
├── index.tsx                     # Screen component (main entry)
├── [id].tsx                      # Dynamic route (if needed)
├── _layout.tsx                   # Layout wrapper (if needed)
├── _constants/                   # Screen-specific constants (prefixed with _)
│   ├── query-keys.ts             # Query keys for this screen
│   └── index.ts
├── _hooks/                       # Screen-specific hooks (prefixed with _)
│   ├── use-[screen-name].ts      # Main hook with screen logic
│   └── index.ts
├── _components/                  # Screen-specific components (prefixed with _)
│   ├── [component-name].tsx
│   └── index.ts
└── _skeletons/                   # Screen-specific skeleton components (prefixed with _)
    ├── [skeleton-name].tsx
    └── index.ts
```

> **Note**: The `_` prefix indicates these folders are not routes (Expo Router convention). Files/folders starting with `_` are ignored by the router.

---

## 🔑 Screen-specific Query Keys

Query keys should be defined within the context of each screen where they are used:

### Structure (`app/users/_constants/query-keys.ts`)

```typescript
export const usersQueryKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  list: (filters: Record<string, unknown>) => ['users', 'list', filters] as const,
} as const;
```

### Multiple Entities in Same Screen (`app/appointments/_constants/query-keys.ts`)

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

### Index Export (`app/users/_constants/index.ts`)

```typescript
export * from './query-keys';
```

### Usage in Screen Hooks

```typescript
// app/users/_hooks/use-users-screen.ts
import { usersQueryKeys } from '../_constants';

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

## 💀 Screen-specific Skeleton Components

Skeletons should be defined within the context of each screen where they are used:

### Structure

```
app/users/_skeletons/
├── user-card-skeleton.tsx
├── user-list-skeleton.tsx
├── users-screen-skeleton.tsx
└── index.ts
```

### Card Skeleton (`app/users/_skeletons/user-card-skeleton.tsx`)

```tsx
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/skeleton';

export const UserCardSkeleton = () => (
  <View style={styles.card}>
    <Skeleton width={120} height={24} />
    <View style={styles.content}>
      <Skeleton width="100%" height={16} />
      <Skeleton width="75%" height={16} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    marginTop: 12,
    gap: 8,
  },
});
```

### List Skeleton (`app/users/_skeletons/user-list-skeleton.tsx`)

```tsx
import { View, StyleSheet } from 'react-native';
import { UserCardSkeleton } from './user-card-skeleton';

export const UserListSkeleton = () => (
  <View style={styles.container}>
    {Array.from({ length: 6 }).map((_, i) => (
      <UserCardSkeleton key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

### Screen Skeleton (`app/users/_skeletons/users-screen-skeleton.tsx`)

```tsx
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/skeleton';
import { UserListSkeleton } from './user-list-skeleton';

export const UsersScreenSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Skeleton width={120} height={32} />
      <Skeleton width={100} height={40} borderRadius={8} />
    </View>
    <Skeleton width="100%" height={48} borderRadius={8} style={styles.searchBar} />
    <UserListSkeleton />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
```

### Index Export (`app/users/_skeletons/index.ts`)

```typescript
export * from './user-card-skeleton';
export * from './user-list-skeleton';
export * from './users-screen-skeleton';
```

### Usage in Screen Component

```tsx
// app/users/index.tsx
import { useUsersScreen } from './_hooks';
import { UserList } from './_components';
import { UsersScreenSkeleton } from './_skeletons';

export default function UsersScreen() {
  const { users, isLoading } = useUsersScreen();

  if (isLoading) {
    return <UsersScreenSkeleton />;
  }

  return (
    // ... actual content
  );
}
```

---

## 🛣️ Expo Router

### Setup (`app/_layout.tsx`)

```tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
```

### Tab Navigator (`app/(tabs)/_layout.tsx`)

```tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Agendamentos',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Navigation

```tsx
import { Link, useRouter } from 'expo-router';

// Declarative navigation
<Link href="/users/123">
  <Text>Ver usuário</Text>
</Link>

// With params
<Link href={{ pathname: '/users/[id]', params: { id: '123' } }}>
  <Text>Ver usuário</Text>
</Link>

// Programmatic navigation
const router = useRouter();
router.push('/users/123');
router.push({ pathname: '/users/[id]', params: { id: '123' } });
router.back();
router.replace('/home');
```

### Route Parameters

```tsx
// app/users/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Use the id parameter
  return <UserDetail userId={id} />;
}
```

### Search Params (URL State)

```tsx
import { useLocalSearchParams, useRouter } from 'expo-router';

export const useUsersFilters = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string; page?: string }>();

  const search = params.search ?? '';
  const page = parseInt(params.page ?? '1', 10);

  const setSearch = (value: string) => {
    router.setParams({ search: value, page: '1' });
  };

  const setPage = (value: number) => {
    router.setParams({ page: String(value) });
  };

  return {
    search,
    setSearch,
    page,
    setPage,
  };
};
```

---

## 🔄 TanStack Query

### Optimistic Updates (Preferred)

**Always prefer updating local cache** instead of just invalidating queries:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersQueryKeys } from '../_constants';

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
import { usersQueryKeys } from '../_constants';

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
import { usersQueryKeys } from '../_constants';

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

### Screen Folder Structure

```
app/users/
├── index.tsx                     # Main screen component
├── [id].tsx                      # User detail screen
├── _constants/
│   ├── query-keys.ts             # Users query keys
│   └── index.ts
├── _hooks/
│   ├── use-users-screen.ts       # Screen logic hook
│   └── index.ts
├── _components/
│   ├── user-list.tsx
│   ├── user-card.tsx
│   └── index.ts
└── _skeletons/
    ├── user-card-skeleton.tsx
    ├── user-list-skeleton.tsx
    ├── users-screen-skeleton.tsx
    └── index.ts
```

### 1. Constants (`app/users/_constants/query-keys.ts`)

```typescript
export const usersQueryKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  list: (filters: Record<string, unknown>) => ['users', 'list', filters] as const,
} as const;
```

### 2. Service (`src/services/user-service.ts`)

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

### 3. Screen Hook (`app/users/_hooks/use-users-screen.ts`)

```typescript
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { usersQueryKeys } from '../_constants';
import { userService } from '@/services/user-service';
import { User, CreateUserPayload } from '@marquei/shared/types';

export const useUsersScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ search?: string; page?: string }>();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // URL state
  const search = params.search ?? '';
  const page = parseInt(params.page ?? '1', 10);

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
  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  const handleCreateUser = async (data: CreateUserPayload) => {
    await createMutation.mutateAsync(data);
    handleCloseModal();
  };

  const handleDeleteUser = (id: string) => {
    Alert.alert('Confirmar exclusão', 'Tem certeza que deseja excluir este usuário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteMutation.mutateAsync(id),
      },
    ]);
  };

  const handleSearch = (value: string) => {
    router.setParams({ search: value, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    router.setParams({ page: String(newPage) });
  };

  const handleUserPress = (userId: string) => {
    router.push({ pathname: '/users/[id]', params: { id: userId } });
  };

  return {
    // Data
    users: usersQuery.data?.items ?? [],
    totalPages: usersQuery.data?.totalPages ?? 0,
    isLoading: usersQuery.isLoading,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Modal
    isModalVisible,
    handleOpenModal,
    handleCloseModal,

    // Actions
    handleCreateUser,
    handleDeleteUser,
    handleUserPress,

    // Filters
    search,
    handleSearch,
    page,
    handlePageChange,
  };
};
```

### 4. Screen Component (`app/users/index.tsx`)

```tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useUsersScreen } from './_hooks';
import { UserList } from './_components';
import { UsersScreenSkeleton } from './_skeletons';

export default function UsersScreen() {
  const {
    users,
    totalPages,
    isLoading,
    isCreating,
    isModalVisible,
    handleOpenModal,
    handleCloseModal,
    handleCreateUser,
    handleDeleteUser,
    handleUserPress,
    search,
    handleSearch,
    page,
    handlePageChange,
  } = useUsersScreen();

  if (isLoading) {
    return <UsersScreenSkeleton />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuários</Text>
        <TouchableOpacity style={styles.button} onPress={handleOpenModal}>
          <Text style={styles.buttonText}>Novo usuário</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuários..."
        value={search}
        onChangeText={handleSearch}
      />

      <UserList users={users} onDelete={handleDeleteUser} onPress={handleUserPress} />

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
          disabled={page <= 1}
          onPress={() => handlePageChange(page - 1)}
        >
          <Text style={styles.pageButtonText}>Anterior</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          Página {page} de {totalPages}
        </Text>
        <TouchableOpacity
          style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
          disabled={page >= totalPages}
          onPress={() => handlePageChange(page + 1)}
        >
          <Text style={styles.pageButtonText}>Próxima</Text>
        </TouchableOpacity>
      </View>

      {/* CreateUserModal component here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  pageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: '#ccc',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
});
```

---

## 🎨 Component Library

### Skeleton Component (`src/components/skeleton/skeleton.tsx`)

```tsx
import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 4, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeleton, { width, height, borderRadius, opacity }, style]} />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
});
```

---

## 📱 Responsive Design

### Screen Dimensions

```typescript
import { Dimensions, useWindowDimensions } from 'react-native';

// Static dimensions
const { width, height } = Dimensions.get('window');

// Responsive hook (updates on rotation)
const { width, height } = useWindowDimensions();
```

### Responsive Patterns

```tsx
import { useWindowDimensions, StyleSheet } from 'react-native';

export const UserList = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>{/* Content */}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  containerTablet: {
    padding: 24,
    maxWidth: 800,
    alignSelf: 'center',
  },
});
```

### Platform-specific Code

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
```

---

## 📝 Conventions and Best Practices

### Naming Conventions

- **Files**: `kebab-case` (e.g., `user-list.tsx`, `use-users.ts`)
- **Components**: `PascalCase` (e.g., `UserList`, `CreateUserModal`)
- **Hooks**: Prefix `use` (e.g., `useUsers`, `useUsersScreen`)
- **Services**: Suffix `Service` (e.g., `userService`)
- **Types/Interfaces**: `PascalCase` (e.g., `User`, `CreateUserPayload`)
- **Query Keys**: Suffix `QueryKeys` (e.g., `usersQueryKeys`)
- **Screen folders with specific resources**: Prefix `_` (e.g., `_hooks`, `_components`, `_skeletons`, `_constants`)

### Imports

Always use the `@/` alias for internal imports:

```typescript
// ✅ Correct
import { Skeleton } from '@/components/skeleton';
import { userService } from '@/services/user-service';
import { User } from '@marquei/shared/types';
import { createUserSchema } from '@marquei/shared/schemas';

// Screen-relative imports for screen-specific resources
import { usersQueryKeys } from '../_constants';
import { useUsersScreen } from './_hooks';
import { UsersScreenSkeleton } from './_skeletons';

// ❌ Incorrect
import { Skeleton } from '../../../components/skeleton';
```

---

## 💬 Comments

Add comments **only in complex code sections**:

```typescript
// ✅ Good: Explains complex logic
// Debounce search to avoid excessive API calls while user is typing
const debouncedSearch = useMemo(() => debounce((term: string) => handleSearch(term), 300), []);

// ❌ Bad: Obvious comment
// Sets the user name
setUserName(name);
```

---

## ✅ Checklist for New Features

- [ ] Create screen folder in `app/[screen-name]/`
- [ ] Create screen-specific constants in `app/[screen-name]/_constants/`
  - [ ] Add query keys to `query-keys.ts`
- [ ] Create screen-specific hooks in `app/[screen-name]/_hooks/`
- [ ] Create screen-specific components in `app/[screen-name]/_components/`
- [ ] Create screen-specific skeletons in `app/[screen-name]/_skeletons/`
- [ ] Create service in `src/services/[feature]-service.ts`
- [ ] Add types to `packages/shared/src/types/`
- [ ] Add Yup schemas to `packages/shared/src/schemas/`
- [ ] Use expo-router search params for URL state management
- [ ] Implement optimistic updates in mutations
- [ ] Use `@/` alias for global imports
- [ ] Use relative imports for screen-specific resources
- [ ] Follow naming conventions
- [ ] Handle loading states with skeletons
- [ ] Use Alert.alert for confirmations (not window.confirm)
