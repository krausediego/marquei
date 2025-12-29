# Docker Infrastructure

This folder contains Docker configurations for the Marquei monorepo.

## Structure

```
infra/docker/
├── docker-compose.yml    # Main compose file
├── .env.example          # Environment variables template
├── init-scripts/         # PostgreSQL initialization scripts
├── backend/              # Backend Dockerfile (future)
├── web/                  # Web Dockerfile (future)
└── mobile/               # Mobile Dockerfile (future)
```

## Quick Start

### From project root

```bash
# Copy environment file
cp infra/docker/.env.example infra/docker/.env

# Start services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down

# Check status
pnpm docker:ps
```

### From this folder

```bash
# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# Stop services
docker-compose down
```

## Services

### PostgreSQL

- **Image**: postgres:16-alpine
- **Port**: 5432
- **Default credentials**:
  - User: `marquei`
  - Password: `marquei123`
  - Database: `marquei`

**Connection String:**

```
postgresql://marquei:marquei123@localhost:5432/marquei
```

### Keycloak

- **Image**: quay.io/keycloak/keycloak:26.0
- **Port**: 8080
- **Admin Console**: http://localhost:8080
- **Default credentials**:
  - User: `admin`
  - Password: `admin123`

Keycloak uses its own database (`keycloak`) on the same PostgreSQL instance.

## Environment Variables

| Variable                 | Default      | Description              |
| ------------------------ | ------------ | ------------------------ |
| POSTGRES_USER            | marquei      | PostgreSQL username      |
| POSTGRES_PASSWORD        | marquei123   | PostgreSQL password      |
| POSTGRES_DB              | marquei      | PostgreSQL database      |
| KEYCLOAK_ADMIN           | admin        | Keycloak admin username  |
| KEYCLOAK_ADMIN_PASSWORD  | admin123     | Keycloak admin password  |
| KEYCLOAK_DB              | keycloak     | Keycloak database name   |

## First Time Setup

1. Start the services:

```bash
pnpm docker:up
```

2. Wait for Keycloak to be ready (check logs):

```bash
pnpm docker:logs
```

3. Access Keycloak admin console at http://localhost:8080

4. Create a new realm for your application

5. Configure clients and users as needed
