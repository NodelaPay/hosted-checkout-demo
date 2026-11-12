import { and, desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { z } from "zod";
import { DomainError } from "@/shared/domain-error";
import {
  addressInputSchema,
  shippingMethodSchema,
  type AddressDto,
  type CheckoutDraftDto,
  type OrderDto,
} from "./checkout.dto";
import {
  addressesTable,
  checkoutDraftsTable,
  ordersTable,
} from "./checkout.table";
import type { CheckoutRepository } from "./repository.contract";
import type { NewOrder } from "./order.entity";

const addressSchema = addressInputSchema.extend({ id: z.uuid() });
const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  unitPrice: z.number().int(),
  quantity: z.number().int().positive(),
});

function toAddress(row: typeof addressesTable.$inferSelect): AddressDto {
  return {
    id: row.id,
    label: row.label,
    tag: row.tag,
    street: row.street,
    city: row.city,
    phone: row.phone,
  };
}

function toOrder(row: typeof ordersTable.$inferSelect): OrderDto {
  return {
    id: row.id,
    status: row.status,
    address: addressSchema.parse(row.address),
    items: z.array(orderItemSchema).parse(row.items),
    shippingMethod: row.shippingMethod,
    subtotal: row.subtotal,
    discount: row.discount,
    tax: row.tax,
    shipping: row.shipping,
    total: row.total,
    promoCode: row.promoCode,
    scheduledDate: row.scheduledDate,
    createdAt: row.createdAt.toISOString(),
  };
}

export class PostgreSqlCheckoutRepository implements CheckoutRepository {
  constructor(private readonly database: NodePgDatabase) {}

  async listAddresses(guestId: string): Promise<readonly AddressDto[]> {
    const rows = await this.database
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.guestId, guestId))
      .orderBy(desc(addressesTable.createdAt));
    return rows.map(toAddress);
  }

  async getAddress(
    guestId: string,
    id: string,
  ): Promise<AddressDto | undefined> {
    const [row] = await this.database
      .select()
      .from(addressesTable)
      .where(
        and(eq(addressesTable.guestId, guestId), eq(addressesTable.id, id)),
      )
      .limit(1);
    return row ? toAddress(row) : undefined;
  }

  async saveAddress(
    guestId: string,
    input: z.infer<typeof addressInputSchema>,
    id?: string,
  ): Promise<AddressDto> {
    const [row] = id
      ? await this.database
          .update(addressesTable)
          .set(input)
          .where(
            and(eq(addressesTable.guestId, guestId), eq(addressesTable.id, id)),
          )
          .returning()
      : await this.database
          .insert(addressesTable)
          .values({ guestId, ...input })
          .returning();

    if (!row) throw new DomainError("not_found", "Address not found");
    return toAddress(row);
  }

  async deleteAddress(guestId: string, id: string): Promise<void> {
    await this.database
      .delete(addressesTable)
      .where(
        and(eq(addressesTable.guestId, guestId), eq(addressesTable.id, id)),
      );
  }

  async getDraft(guestId: string): Promise<CheckoutDraftDto> {
    const [row] = await this.database
      .select()
      .from(checkoutDraftsTable)
      .where(eq(checkoutDraftsTable.guestId, guestId))
      .limit(1);

    return {
      addressId: row?.addressId ?? null,
      shippingMethod: row?.shippingMethod ?? "free",
      promoCode: row?.promoCode ?? null,
      scheduledDate: row?.scheduledDate ?? null,
    };
  }

  async saveDraft(guestId: string, draft: CheckoutDraftDto): Promise<void> {
    shippingMethodSchema.parse(draft.shippingMethod);
    await this.database
      .insert(checkoutDraftsTable)
      .values({ guestId, ...draft })
      .onConflictDoUpdate({
        target: checkoutDraftsTable.guestId,
        set: { ...draft, updatedAt: new Date() },
      });
  }

  async createOrder(input: NewOrder): Promise<OrderDto> {
    await this.database
      .insert(ordersTable)
      .values({ ...input, status: "pending_payment" })
      .onConflictDoNothing();

    const order = await this.getOrderByIdempotencyKey(
      input.guestId,
      input.idempotencyKey,
    );

    if (!order) throw new Error("Order was not saved");
    return order;
  }

  async getOrderByIdempotencyKey(
    guestId: string,
    idempotencyKey: string,
  ): Promise<OrderDto | undefined> {
    const [row] = await this.database
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.guestId, guestId),
          eq(ordersTable.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);
    return row ? toOrder(row) : undefined;
  }

  async listOrders(guestId: string): Promise<readonly OrderDto[]> {
    const rows = await this.database
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.guestId, guestId))
      .orderBy(desc(ordersTable.createdAt));
    return rows.map(toOrder);
  }

  async getOrder(
    guestId: string,
    orderId: string,
  ): Promise<OrderDto | undefined> {
    const [row] = await this.database
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.guestId, guestId), eq(ordersTable.id, orderId)))
      .limit(1);

    return row ? toOrder(row) : undefined;
  }

  async markOrderPaid(orderId: string): Promise<void> {
    await this.database
      .update(ordersTable)
      .set({ status: "paid" })
      .where(eq(ordersTable.id, orderId));
  }
}
