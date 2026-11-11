import { getDatabaseProvider } from "@/infrastructure/database/factory";
import type { CartRepository } from "./repository.contract";
import { PostgreSqlCartRepository } from "./repository.postgresql";

export class CartRepositoryFactory {
  static create(): CartRepository {
    return new PostgreSqlCartRepository(getDatabaseProvider().client);
  }
}
