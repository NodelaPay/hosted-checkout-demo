# Project architecture rules

- Keep each feature in `src/modules/<module>/`. A module owns its entity, repository contract and adapter, service, controller, validation, and tables where applicable.
- Only a module's service contract and public DTOs may be consumed by another module. A service must never import or use another module's entity or repository directly.
- Keep entities and persistence models private to their owning module. Translate to public DTOs at the service boundary.
- Depend on contracts for repositories and external services. Construct concrete providers in factories or the composition root so implementations can be replaced.
- Use strict TypeScript. Avoid `any` and unchecked casts. Use classes where they improve cohesion, lifecycle management, or dependency injection; simple pure helpers may remain functions.
- Keep controllers thin: parse input, call a service, and map its result to HTTP. Put business rules in services and persistence details in repositories.
- Add module tables to the Drizzle schema glob and commit generated migrations with schema changes.
- The current storefront and checkout flow are frontend-only views using local demo data. Do not treat their demo interactions as payment processing or persisted domain behavior.
