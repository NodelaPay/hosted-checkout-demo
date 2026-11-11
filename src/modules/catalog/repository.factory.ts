import { getDatabaseProvider } from "@/infrastructure/database/factory";
import type { ProductRepository } from "./repository.contract";
import { PostgreSqlProductRepository } from "./repository.postgresql";

export class ProductRepositoryFactory {
  static create(): ProductRepository {
    return new PostgreSqlProductRepository(getDatabaseProvider().client);
  }
}
