import {
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const favoritesTable = pgTable(
  "favorites",
  {
    guestId: uuid("guest_id").notNull(),
    productId: varchar("product_id", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.guestId, table.productId] })],
);
