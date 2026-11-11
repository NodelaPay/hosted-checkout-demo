import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const contactMessagesTable = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 80 }).notNull(),
  lastName: varchar("last_name", { length: 80 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
