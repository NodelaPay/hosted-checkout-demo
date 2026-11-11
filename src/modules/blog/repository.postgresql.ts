import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { z } from "zod";
import type { BlogPostDto } from "./blog-post.dto";
import { blogPostsTable } from "./blog.table";
import type { BlogRepository } from "./repository.contract";

function toDto(row: typeof blogPostsTable.$inferSelect): BlogPostDto {
  return {
    slug: row.slug,
    category: row.category,
    title: row.title,
    summary: row.summary,
    image: row.image,
    readTime: row.readTime,
    paragraphs: z.array(z.string()).parse(row.paragraphs),
  };
}

export class PostgreSqlBlogRepository implements BlogRepository {
  constructor(private readonly database: NodePgDatabase) {}

  async list(): Promise<readonly BlogPostDto[]> {
    const rows = await this.database.select().from(blogPostsTable);
    return rows.map(toDto);
  }

  async getBySlug(slug: string): Promise<BlogPostDto | undefined> {
    const [row] = await this.database
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, slug))
      .limit(1);
    return row ? toDto(row) : undefined;
  }
}
