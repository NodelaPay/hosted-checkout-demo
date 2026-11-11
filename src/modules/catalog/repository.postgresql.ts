import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ProductDto } from "./product.dto";
import { productsTable } from "./product.table";
import type { ProductRepository } from "./repository.contract";

function toDto(row: typeof productsTable.$inferSelect): ProductDto {
  return {
    id: row.id,
    name: row.name,
    shortName: row.shortName,
    price: row.price,
    ...(row.oldPrice === null ? {} : { oldPrice: row.oldPrice }),
    image: row.image,
    category: row.category,
    brand: row.brand,
    color: row.color,
    ...(row.memory === null ? {} : { memory: row.memory }),
  };
}

export class PostgreSqlProductRepository implements ProductRepository {
  constructor(private readonly database: NodePgDatabase) {}

  async list(): Promise<readonly ProductDto[]> {
    const rows = await this.database.select().from(productsTable);
    return rows.map(toDto);
  }

  async getById(id: string): Promise<ProductDto | undefined> {
    const [row] = await this.database
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    return row ? toDto(row) : undefined;
  }
}
