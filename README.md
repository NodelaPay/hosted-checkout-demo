# Hosted checkout demo: project scaffold

This repository currently contains the application and infrastructure foundation. Product modules and the checkout UI will be added after their requirements are supplied.

## Stack

- Next.js App Router, React, strict TypeScript
- PostgreSQL with Drizzle ORM
- Redis for caching and rate limiting
- ESLint and Prettier

## Local setup

Requires Node.js 20.9 or newer, npm, and Docker for the local services.

```bash
cp .env.example .env.local
npm install
docker compose up -d
npm run dev
```

Open <http://localhost:3000>. The page is a placeholder for the UI you will provide.

## Project commands

```bash
npm run typecheck
npm run lint
npm run build
npm run db:generate
npm run db:migrate
```

`db:generate` becomes useful when the first module adds a `*.table.ts` schema. Generate and commit a migration after changing a module's table.

## Module boundary

Future modules belong in `src/modules/<name>/`. Each module owns its entity, repository, service, controller, and schema where those parts are needed. Repositories expose module-local contracts; the PostgreSQL adapter uses Drizzle behind the contract. Other modules communicate through a service contract and public DTOs only. They must not reach into another module's entity or repository.

Infrastructure contracts and factories are in `src/infrastructure/`. Database, cache, and rate-limit implementations are selected there. Adding a provider means implementing the appropriate contract and updating its factory and configuration. PostgreSQL and Redis are the configured initial providers. External product services will follow the same pattern when their requirements are known.

The rate limiter uses one atomic Redis script per request. Cache values are strings so each module decides its own serialization and key namespace. Redis connection failures are surfaced to callers; routes should choose their own failure behavior when they are implemented.
