import { DomainError } from "@/shared/domain-error";
import type { CatalogServiceContract } from "@/modules/catalog/service";
import { catalogService } from "@/modules/catalog/service";
import type { FavoritesRepository } from "./repository.contract";
import { FavoritesRepositoryFactory } from "./repository.factory";

export interface FavoritesServiceContract {
  list(guestId: string): Promise<readonly string[]>;
  set(guestId: string, productId: string, favorite: boolean): Promise<void>;
}

export class FavoritesService implements FavoritesServiceContract {
  constructor(
    private readonly repository: FavoritesRepository,
    private readonly catalog: CatalogServiceContract,
  ) {}

  list(guestId: string): Promise<readonly string[]> {
    return this.repository.list(guestId);
  }

  async set(
    guestId: string,
    productId: string,
    favorite: boolean,
  ): Promise<void> {
    if (favorite) {
      if (!(await this.catalog.getById(productId))) {
        throw new DomainError("not_found", "Product not found");
      }
      await this.repository.add(guestId, productId);
      return;
    }

    await this.repository.remove(guestId, productId);
  }
}

export const favoritesService: FavoritesServiceContract = new FavoritesService(
  FavoritesRepositoryFactory.create(),
  catalogService,
);
