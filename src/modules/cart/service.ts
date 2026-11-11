import { DomainError } from "@/shared/domain-error";
import type { CatalogServiceContract } from "@/modules/catalog/service";
import { catalogService } from "@/modules/catalog/service";
import type { CartItemDto } from "./cart.dto";
import { CartItem } from "./cart.entity";
import type { CartRepository } from "./repository.contract";
import { CartRepositoryFactory } from "./repository.factory";

export interface CartServiceContract {
  list(guestId: string): Promise<readonly CartItemDto[]>;
  set(guestId: string, productId: string, quantity: number): Promise<void>;
  clear(guestId: string): Promise<void>;
}

export class CartService implements CartServiceContract {
  constructor(
    private readonly repository: CartRepository,
    private readonly catalog: CatalogServiceContract,
  ) {}

  list(guestId: string): Promise<readonly CartItemDto[]> {
    return this.repository.list(guestId);
  }

  async set(
    guestId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const item = CartItem.create(productId, quantity);

    if (item.quantity === 0) {
      await this.repository.remove(guestId, productId);
      return;
    }

    const product = await this.catalog.getById(productId);
    if (!product) throw new DomainError("not_found", "Product not found");
    await this.repository.set(guestId, item.productId, item.quantity);
  }

  clear(guestId: string): Promise<void> {
    return this.repository.clear(guestId);
  }
}

export const cartService: CartServiceContract = new CartService(
  CartRepositoryFactory.create(),
  catalogService,
);
