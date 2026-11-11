import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const productReviewsTable = pgTable(
  "product_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: varchar("product_id", { length: 100 }).notNull(),
    guestId: uuid("guest_id"),
    authorName: varchar("author_name", { length: 80 }).notNull(),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("product_reviews_guest_idx").on(table.productId, table.guestId),
  ],
);
