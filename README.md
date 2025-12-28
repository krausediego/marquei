# MARQUEI

Monorepo do projeto MARQUEI utilizando **Turborepo** com **PNPM**.

## 📁 Estrutura do Projeto

```
marquei/
├── apps/
│   ├── backend/     # API Node.js + Express + TypeScript
│   ├── web/         # Aplicação web React + Vite + TypeScript
│   └── mobile/      # Aplicativo mobile React Native + Expo + TypeScript
├── packages/
│   ├── ui/          # Componentes UI compartilhados
│   ├── eslint-config/   # Configurações ESLint compartilhadas
│   └── typescript-config/ # Configurações TypeScript compartilhadas
└── turbo.json       # Configuração do Turborepo
```

## 🚀 Começando

### Pré-requisitos

- Node.js >= 18
- PNPM >= 9.0.0

### Instalação

```bash
# Instalar dependências
pnpm install
```

### Comandos

```bash
# Desenvolvimento (todos os apps)
pnpm dev

# Build (todos os apps)
pnpm build

# Lint (todos os apps)
pnpm lint

# Executar apenas um app específico
pnpm --filter @marquei/backend dev
pnpm --filter @marquei/web dev
pnpm --filter @marquei/mobile start
```

## 📦 Apps

### Backend (`apps/backend`)

- **Stack**: Node.js, Express, TypeScript
- **Porta**: 3001
- **Comandos**:
  - `pnpm --filter @marquei/backend dev` - Desenvolvimento com hot reload
  - `pnpm --filter @marquei/backend build` - Build para produção
  - `pnpm --filter @marquei/backend start` - Executar build de produção

### Web (`apps/web`)

- **Stack**: React, Vite, TypeScript
- **Porta**: 5173
- **Comandos**:
  - `pnpm --filter @marquei/web dev` - Desenvolvimento com hot reload
  - `pnpm --filter @marquei/web build` - Build para produção
  - `pnpm --filter @marquei/web preview` - Preview do build

### Mobile (`apps/mobile`)

- **Stack**: React Native, Expo, TypeScript
- **Comandos**:
  - `pnpm --filter @marquei/mobile start` - Iniciar Expo
  - `pnpm --filter @marquei/mobile android` - Executar no Android
  - `pnpm --filter @marquei/mobile ios` - Executar no iOS
  - `pnpm --filter @marquei/mobile web` - Executar versão web

## 📚 Packages

- **@marquei/ui**: Componentes React compartilhados
- **@marquei/eslint-config**: Configurações ESLint
- **@marquei/typescript-config**: Configurações TypeScript base

## 🛠️ Tecnologias

- [Turborepo](https://turbo.build/repo) - Ferramenta de build para monorepos
- [PNPM](https://pnpm.io/) - Gerenciador de pacotes rápido e eficiente
- [TypeScript](https://www.typescriptlang.org/) - JavaScript tipado
- [React](https://react.dev/) - Biblioteca UI
- [Vite](https://vitejs.dev/) - Build tool moderno
- [Express](https://expressjs.com/) - Framework web Node.js
- [Expo](https://expo.dev/) - Plataforma React Native
