import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const blogPostsTable = pgTable("blog_posts", {
  slug: varchar("slug", { length: 120 }).primaryKey(),
  category: varchar("category", { length: 80 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: text("summary").notNull(),
  image: varchar("image", { length: 250 }).notNull(),
  readTime: varchar("read_time", { length: 30 }).notNull(),
  paragraphs: jsonb("paragraphs").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
