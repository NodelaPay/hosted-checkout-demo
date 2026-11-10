# Hosted checkout demo: project scaffold

This repository contains a responsive storefront and checkout UI based on the supplied local Figma exports. The product catalog and cart use local demo data; no backend routes or payment processing are connected yet.

## Stack

- Next.js App Router, React, strict TypeScript, Tailwind CSS
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

Open <http://localhost:3000>. The UI includes the home page, catalog, product detail, cart, mobile filter view, and address, shipping, and payment steps.

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

Modules belong in `src/modules/<name>/`. Each backend module will own its entity, repository, service, controller, and schema where those parts are needed. Repositories expose module-local contracts; the PostgreSQL adapter uses Drizzle behind the contract. Other modules communicate through a service contract and public DTOs only. They must not reach into another module's entity or repository.

Infrastructure contracts and factories are in `src/infrastructure/`. Database, cache, and rate-limit implementations are selected there. Adding a provider means implementing the appropriate contract and updating its factory and configuration. PostgreSQL and Redis are the configured initial providers. External product services will follow the same pattern when their requirements are known.

The rate limiter uses one atomic Redis script per request. Cache values are strings so each module decides its own serialization and key namespace. Redis connection failures are surfaced to callers; routes should choose their own failure behavior when they are implemented.

## Frontend demo

- `/` — home
- `/products` — catalog with search, sorting, and filters
- `/products/filters` — mobile filter screen
- `/products/iphone-14-pro-max` — product detail
- `/cart` — cart with quantity controls and demo promo code `CYBER10`
- `/checkout/address`, `/checkout/shipping`, `/checkout/payment` — checkout UI steps

The cart is stored in the browser's local storage. The payment button only displays a demo message. Product imagery was downloaded as suitable temporary imagery because the local Figma export did not include its nested image assets. Replace these images with the original design assets before production use.
