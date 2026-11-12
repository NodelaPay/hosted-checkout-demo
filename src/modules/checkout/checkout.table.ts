import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const shippingMethodEnum = pgEnum("shipping_method", [
  "free",
  "express",
  "schedule",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "paid",
]);

export const addressesTable = pgTable("checkout_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: uuid("guest_id").notNull(),
  label: varchar("label", { length: 80 }).notNull(),
  tag: varchar("tag", { length: 30 }).notNull(),
  street: varchar("street", { length: 200 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const checkoutDraftsTable = pgTable("checkout_drafts", {
  guestId: uuid("guest_id").primaryKey(),
  addressId: uuid("address_id"),
  shippingMethod: shippingMethodEnum("shipping_method")
    .default("free")
    .notNull(),
  promoCode: varchar("promo_code", { length: 30 }),
  scheduledDate: varchar("scheduled_date", { length: 10 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ordersTable = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    guestId: uuid("guest_id").notNull(),
    idempotencyKey: uuid("idempotency_key").notNull(),
    status: orderStatusEnum("status").default("pending_payment").notNull(),
    address: jsonb("address").notNull(),
    items: jsonb("items").notNull(),
    shippingMethod: shippingMethodEnum("shipping_method").notNull(),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull(),
    tax: integer("tax").notNull(),
    shipping: integer("shipping").notNull(),
    total: integer("total").notNull(),
    promoCode: varchar("promo_code", { length: 30 }),
    scheduledDate: varchar("scheduled_date", { length: 10 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("orders_guest_idempotency_idx").on(
      table.guestId,
      table.idempotencyKey,
    ),
  ],
);
