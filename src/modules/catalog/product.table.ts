import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const productCategoryEnum = pgEnum("product_category", [
  "Phones",
  "Computers",
  "Smart Watches",
  "Headphones",
  "Accessories",
]);

export const productsTable = pgTable("products", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 250 }).notNull(),
  shortName: varchar("short_name", { length: 180 }).notNull(),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  image: varchar("image", { length: 250 }).notNull(),
  category: productCategoryEnum("category").notNull(),
  brand: varchar("brand", { length: 80 }).notNull(),
  color: varchar("color", { length: 80 }).notNull(),
  memory: varchar("memory", { length: 30 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
