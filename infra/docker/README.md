# Docker Infrastructure

This folder contains Docker configurations for the Marquei monorepo.

## Structure

```
infra/docker/
├── docker-compose.yml    # Main compose file
├── .env.example          # Environment variables template
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

### Connection String

```
postgresql://marquei:marquei123@localhost:5432/marquei
```

## Environment Variables

| Variable          | Default      | Description           |
| ----------------- | ------------ | --------------------- |
| POSTGRES_USER     | marquei      | PostgreSQL username   |
| POSTGRES_PASSWORD | marquei123   | PostgreSQL password   |
| POSTGRES_DB       | marquei      | PostgreSQL database   |



