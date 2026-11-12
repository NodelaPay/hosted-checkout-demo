import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", [
  "creating",
  "failed",
  "pending",
  "paid",
  "cancelled",
  "expired",
]);

export const paymentsTable = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey(),
    orderId: uuid("order_id").notNull(),
    guestId: uuid("guest_id").notNull(),
    reference: varchar("reference", { length: 120 }).notNull(),
    invoiceId: varchar("invoice_id", { length: 100 }),
    checkoutUrl: varchar("checkout_url", { length: 1000 }),
    status: paymentStatusEnum("status").default("creating").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("payments_order_idx").on(table.orderId),
    uniqueIndex("payments_reference_idx").on(table.reference),
    uniqueIndex("payments_invoice_idx").on(table.invoiceId),
  ],
);
