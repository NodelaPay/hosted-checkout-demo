# Hosted checkout demo

A responsive Next.js storefront based on the supplied local Figma exports. The application uses PostgreSQL and Drizzle for persistent data, Redis for catalog and journal caching, and Redis-backed rate limiting for writes.

## Local setup

Requires Node.js 20.9 or newer, npm, and Docker. The project's containers bind to `127.0.0.1:5434` and `127.0.0.1:6381` to avoid other local PostgreSQL and Redis services.

```bash
cp .env.example .env.local
```

Set `SESSION_SECRET` in `.env.local` to a random value of at least 32 characters. You can generate one with `openssl rand -hex 32`. Then run:

```bash
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Open <http://localhost:3000>. The seed command is safe to rerun; it updates its fixed catalog, journal, and sample review records.

## Current behavior

- Products and journal posts are read from PostgreSQL. Their public lists are cached in Redis for 60 seconds.
- A signed, HTTP-only guest cookie identifies each browser's cart, favorites, checkout draft, addresses, and orders. No account registration or sign-in is configured.
- Cart quantities, favorites, addresses, shipping choices, promo code `CYBER10`, product reviews, and contact submissions persist in PostgreSQL.
- Checkout calculates totals on the server and creates an idempotent order with status `pending_payment`. The payment screen does not collect card details or charge anyone. Payment provider integration is intentionally left open.
- Order history for the current guest session appears on `/account`.

## Routes

| Screens    | Paths                                                                                 |
| ---------- | ------------------------------------------------------------------------------------- |
| Storefront | `/`, `/products`, `/products/[id]`, `/products/filters`                               |
| Shopping   | `/cart`, `/favorites`, `/checkout/address`, `/checkout/shipping`, `/checkout/payment` |
| Content    | `/about`, `/contact`, `/blog`, `/blog/[slug]`, `/account`                             |

The JSON API lives under `/api`. Catalog and blog GET routes are public; mutation routes validate input and use Redis rate limits. Guest data is scoped to the signed cookie. Use `npm run test:smoke` while the app is running to exercise the main API flow.
The smoke command writes sample orders, a contact message, and a review to the connected database.

## Project commands

```bash
npm run format:check
npm run typecheck
npm run lint
npm run build
npm run test:smoke
npm run db:generate
npm run db:migrate
npm run db:seed
```

Commit generated migrations when changing any `*.table.ts` schema.

## Module boundaries

Feature code lives in `src/modules/<name>/`. Each backend module owns its tables, repository contract and PostgreSQL adapter, service contract and implementation, and API controller. Other modules consume public DTOs and service contracts; they do not import another module's tables or repositories. Concrete database, cache, and rate-limit providers are selected in `src/infrastructure/` factories.

The product imagery in `public/images` is suitable temporary imagery, because the local Figma export did not include its nested image assets. See `public/images/SOURCES.md` for sources.
