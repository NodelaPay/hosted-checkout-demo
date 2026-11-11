import {
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const cartItemsTable = pgTable(
  "cart_items",
  {
    guestId: uuid("guest_id").notNull(),
    productId: varchar("product_id", { length: 100 }).notNull(),
    quantity: integer("quantity").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.guestId, table.productId] })],
);
