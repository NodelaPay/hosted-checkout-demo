import type { AddressDto, CheckoutDraftDto, OrderDto } from "./checkout.dto";
import type { z } from "zod";
import type { addressInputSchema } from "./checkout.dto";
import type { NewOrder } from "./order.entity";

export interface CheckoutRepository {
  listAddresses(guestId: string): Promise<readonly AddressDto[]>;
  getAddress(guestId: string, id: string): Promise<AddressDto | undefined>;
  saveAddress(
    guestId: string,
    input: z.infer<typeof addressInputSchema>,
    id?: string,
  ): Promise<AddressDto>;
  deleteAddress(guestId: string, id: string): Promise<void>;
  getDraft(guestId: string): Promise<CheckoutDraftDto>;
  saveDraft(guestId: string, draft: CheckoutDraftDto): Promise<void>;
  createOrder(input: NewOrder): Promise<OrderDto>;
  getOrderByIdempotencyKey(
    guestId: string,
    idempotencyKey: string,
  ): Promise<OrderDto | undefined>;
  listOrders(guestId: string): Promise<readonly OrderDto[]>;
  getOrder(guestId: string, orderId: string): Promise<OrderDto | undefined>;
  markOrderPaid(orderId: string): Promise<void>;
}
