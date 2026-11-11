import { getDatabaseProvider } from "@/infrastructure/database/factory";
import type { FavoritesRepository } from "./repository.contract";
import { PostgreSqlFavoritesRepository } from "./repository.postgresql";

export class FavoritesRepositoryFactory {
  static create(): FavoritesRepository {
    return new PostgreSqlFavoritesRepository(getDatabaseProvider().client);
  }
}
