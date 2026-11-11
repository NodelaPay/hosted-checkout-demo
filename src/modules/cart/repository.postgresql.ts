import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { cartItemsTable } from "./cart.table";
import type { CartItemDto } from "./cart.dto";
import { CartItem } from "./cart.entity";
import type { CartRepository } from "./repository.contract";

export class PostgreSqlCartRepository implements CartRepository {
  constructor(private readonly database: NodePgDatabase) {}

  async list(guestId: string): Promise<readonly CartItemDto[]> {
    const rows = await this.database
      .select({
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
      })
      .from(cartItemsTable)
      .where(eq(cartItemsTable.guestId, guestId));

    return rows.map((row) =>
      CartItem.create(row.productId, row.quantity).toDto(),
    );
  }

  async set(
    guestId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.database
      .insert(cartItemsTable)
      .values({ guestId, productId, quantity })
      .onConflictDoUpdate({
        target: [cartItemsTable.guestId, cartItemsTable.productId],
        set: { quantity, updatedAt: new Date() },
      });
  }

  async remove(guestId: string, productId: string): Promise<void> {
    await this.database
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.guestId, guestId),
          eq(cartItemsTable.productId, productId),
        ),
      );
  }

  async clear(guestId: string): Promise<void> {
    await this.database
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.guestId, guestId));
  }
}
