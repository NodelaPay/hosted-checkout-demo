import { getDatabaseProvider } from "@/infrastructure/database/factory";
import type { CheckoutRepository } from "./repository.contract";
import { PostgreSqlCheckoutRepository } from "./repository.postgresql";

export class CheckoutRepositoryFactory {
  static create(): CheckoutRepository {
    return new PostgreSqlCheckoutRepository(getDatabaseProvider().client);
  }
}
