import { desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ReviewDto, ReviewInput } from "./review.dto";
import { productReviewsTable } from "./review.table";
import type { ReviewRepository } from "./review-repository.contract";

function toDto(row: typeof productReviewsTable.$inferSelect): ReviewDto {
  return {
    id: row.id,
    productId: row.productId,
    authorName: row.authorName,
    rating: row.rating,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

export class PostgreSqlReviewRepository implements ReviewRepository {
  constructor(private readonly database: NodePgDatabase) {}

  async list(productId: string): Promise<readonly ReviewDto[]> {
    const rows = await this.database
      .select()
      .from(productReviewsTable)
      .where(eq(productReviewsTable.productId, productId))
      .orderBy(desc(productReviewsTable.createdAt));
    return rows.map(toDto);
  }

  async save(
    productId: string,
    guestId: string,
    input: ReviewInput,
  ): Promise<ReviewDto> {
    const [row] = await this.database
      .insert(productReviewsTable)
      .values({ productId, guestId, ...input })
      .onConflictDoUpdate({
        target: [productReviewsTable.productId, productReviewsTable.guestId],
        set: { ...input, createdAt: new Date() },
      })
      .returning();

    if (!row) throw new Error("Review was not saved");
    return toDto(row);
  }
}
