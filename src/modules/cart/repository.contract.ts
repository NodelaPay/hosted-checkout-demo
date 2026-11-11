import type { CartItemDto } from "./cart.dto";

export interface CartRepository {
  list(guestId: string): Promise<readonly CartItemDto[]>;
  set(guestId: string, productId: string, quantity: number): Promise<void>;
  remove(guestId: string, productId: string): Promise<void>;
  clear(guestId: string): Promise<void>;
}
