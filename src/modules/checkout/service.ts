import { DomainError } from "@/shared/domain-error";
import type { CartServiceContract } from "@/modules/cart/service";
import { cartService } from "@/modules/cart/service";
import type { CatalogServiceContract } from "@/modules/catalog/service";
import { catalogService } from "@/modules/catalog/service";
import type { z } from "zod";
import type {
  addressInputSchema,
  AddressDto,
  CheckoutDraftDto,
  OrderDto,
  OrderItemDto,
  OrderQuoteDto,
} from "./checkout.dto";
import { calculateQuote } from "./pricing";
import { PendingOrder } from "./order.entity";
import type { CheckoutRepository } from "./repository.contract";
import { CheckoutRepositoryFactory } from "./repository.factory";

export interface CheckoutServiceContract {
  listAddresses(guestId: string): Promise<readonly AddressDto[]>;
  saveAddress(
    guestId: string,
    input: z.infer<typeof addressInputSchema>,
    id?: string,
  ): Promise<AddressDto>;
  deleteAddress(guestId: string, id: string): Promise<void>;
  getDraft(guestId: string): Promise<CheckoutDraftDto>;
  saveDraft(guestId: string, draft: CheckoutDraftDto): Promise<void>;
  setPromo(guestId: string, promoCode: string | null): Promise<void>;
  quote(guestId: string): Promise<OrderQuoteDto>;
  createOrder(guestId: string, idempotencyKey: string): Promise<OrderDto>;
  listOrders(guestId: string): Promise<readonly OrderDto[]>;
}

export class CheckoutService implements CheckoutServiceContract {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly cart: CartServiceContract,
    private readonly catalog: CatalogServiceContract,
  ) {}

  listAddresses(guestId: string): Promise<readonly AddressDto[]> {
    return this.repository.listAddresses(guestId);
  }

  saveAddress(
    guestId: string,
    input: z.infer<typeof addressInputSchema>,
    id?: string,
  ): Promise<AddressDto> {
    return this.repository.saveAddress(guestId, input, id);
  }

  async deleteAddress(guestId: string, id: string): Promise<void> {
    await this.repository.deleteAddress(guestId, id);
    const draft = await this.repository.getDraft(guestId);
    if (draft.addressId === id) {
      await this.repository.saveDraft(guestId, { ...draft, addressId: null });
    }
  }

  getDraft(guestId: string): Promise<CheckoutDraftDto> {
    return this.repository.getDraft(guestId);
  }

  async saveDraft(guestId: string, draft: CheckoutDraftDto): Promise<void> {
    if (draft.promoCode && draft.promoCode !== "CYBER10") {
      throw new DomainError("invalid_input", "Invalid promo code");
    }
    if (draft.addressId) {
      const address = await this.repository.getAddress(
        guestId,
        draft.addressId,
      );
      if (!address) throw new DomainError("not_found", "Address not found");
    }
    if (draft.shippingMethod === "schedule") {
      if (
        !draft.scheduledDate ||
        draft.scheduledDate <= new Date().toISOString().slice(0, 10)
      ) {
        throw new DomainError("invalid_input", "Choose a future delivery date");
      }
    }
    await this.repository.saveDraft(guestId, draft);
  }

  async setPromo(guestId: string, promoCode: string | null): Promise<void> {
    if (promoCode && promoCode !== "CYBER10") {
      throw new DomainError("invalid_input", "Invalid promo code");
    }
    const draft = await this.repository.getDraft(guestId);
    await this.repository.saveDraft(guestId, { ...draft, promoCode });
  }

  private async orderItems(guestId: string): Promise<readonly OrderItemDto[]> {
    const cartItems = await this.cart.list(guestId);
    const products = await this.catalog.list();

    return cartItems.map((item) => {
      const product = products.find(
        (candidate) => candidate.id === item.productId,
      );
      if (!product)
        throw new DomainError(
          "conflict",
          "A cart product is no longer available",
        );

      return {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
      };
    });
  }

  async quote(guestId: string): Promise<OrderQuoteDto> {
    const items = await this.orderItems(guestId);
    const draft = await this.repository.getDraft(guestId);
    return calculateQuote(items, draft.shippingMethod, draft.promoCode);
  }

  async createOrder(
    guestId: string,
    idempotencyKey: string,
  ): Promise<OrderDto> {
    const existing = await this.repository.getOrderByIdempotencyKey(
      guestId,
      idempotencyKey,
    );
    if (existing) {
      const cartItems = await this.cart.list(guestId);
      const matchesExistingOrder =
        cartItems.length === existing.items.length &&
        cartItems.every((cartItem) =>
          existing.items.some(
            (orderItem) =>
              orderItem.productId === cartItem.productId &&
              orderItem.quantity === cartItem.quantity,
          ),
        );
      if (matchesExistingOrder) await this.cart.clear(guestId);
      return existing;
    }

    const draft = await this.repository.getDraft(guestId);
    if (!draft.addressId) {
      throw new DomainError("invalid_input", "Select an address first");
    }
    const address = await this.repository.getAddress(guestId, draft.addressId);
    if (!address) {
      throw new DomainError("invalid_input", "Selected address is unavailable");
    }

    const items = await this.orderItems(guestId);
    const pendingOrder = PendingOrder.create({
      guestId,
      idempotencyKey,
      address,
      items,
      draft,
    });
    const order = await this.repository.createOrder(pendingOrder.toRecord());
    await this.cart.clear(guestId);
    return order;
  }

  listOrders(guestId: string): Promise<readonly OrderDto[]> {
    return this.repository.listOrders(guestId);
  }
}

export const checkoutService: CheckoutServiceContract = new CheckoutService(
  CheckoutRepositoryFactory.create(),
  cartService,
  catalogService,
);
