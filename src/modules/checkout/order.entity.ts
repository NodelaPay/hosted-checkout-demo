import { DomainError } from "@/shared/domain-error";
import type {
  AddressDto,
  CheckoutDraftDto,
  OrderItemDto,
} from "./checkout.dto";
import { calculateQuote } from "./pricing";

export interface NewOrder {
  readonly guestId: string;
  readonly idempotencyKey: string;
  readonly address: AddressDto;
  readonly items: readonly OrderItemDto[];
  readonly shippingMethod: CheckoutDraftDto["shippingMethod"];
  readonly subtotal: number;
  readonly discount: number;
  readonly tax: number;
  readonly shipping: number;
  readonly total: number;
  readonly promoCode: string | null;
  readonly scheduledDate: string | null;
}

interface PendingOrderInput {
  readonly guestId: string;
  readonly idempotencyKey: string;
  readonly address: AddressDto;
  readonly items: readonly OrderItemDto[];
  readonly draft: CheckoutDraftDto;
}

export class PendingOrder {
  private constructor(private readonly record: NewOrder) {}

  static create(input: PendingOrderInput): PendingOrder {
    if (input.items.length === 0) {
      throw new DomainError("invalid_input", "Your cart is empty");
    }
    if (
      input.draft.shippingMethod === "schedule" &&
      (!input.draft.scheduledDate ||
        input.draft.scheduledDate <= new Date().toISOString().slice(0, 10))
    ) {
      throw new DomainError("invalid_input", "Choose a future delivery date");
    }

    const quote = calculateQuote(
      input.items,
      input.draft.shippingMethod,
      input.draft.promoCode,
    );

    return new PendingOrder({
      guestId: input.guestId,
      idempotencyKey: input.idempotencyKey,
      address: input.address,
      items: input.items,
      shippingMethod: input.draft.shippingMethod,
      scheduledDate: input.draft.scheduledDate,
      promoCode: input.draft.promoCode,
      ...quote,
    });
  }

  toRecord(): NewOrder {
    return this.record;
  }
}
