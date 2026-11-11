import { DomainError } from "@/shared/domain-error";
import type { CartItemDto } from "./cart.dto";

export class CartItem {
  private constructor(
    readonly productId: string,
    readonly quantity: number,
  ) {}

  static create(productId: string, quantity: number): CartItem {
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
      throw new DomainError(
        "invalid_input",
        "Quantity must be between 0 and 99",
      );
    }

    return new CartItem(productId, quantity);
  }

  toDto(): CartItemDto {
    return { productId: this.productId, quantity: this.quantity };
  }
}
