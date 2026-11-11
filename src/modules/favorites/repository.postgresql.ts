import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { favoritesTable } from "./favorites.table";
import type { FavoritesRepository } from "./repository.contract";

export class PostgreSqlFavoritesRepository implements FavoritesRepository {
  constructor(private readonly database: NodePgDatabase) {}

  async list(guestId: string): Promise<readonly string[]> {
    const rows = await this.database
      .select({ productId: favoritesTable.productId })
      .from(favoritesTable)
      .where(eq(favoritesTable.guestId, guestId));
    return rows.map((row) => row.productId);
  }

  async add(guestId: string, productId: string): Promise<void> {
    await this.database
      .insert(favoritesTable)
      .values({ guestId, productId })
      .onConflictDoNothing();
  }

  async remove(guestId: string, productId: string): Promise<void> {
    await this.database
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.guestId, guestId),
          eq(favoritesTable.productId, productId),
        ),
      );
  }
}
