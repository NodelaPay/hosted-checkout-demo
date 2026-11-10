import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import type { DatabaseProvider } from "../contract";

export class PostgreSqlProvider implements DatabaseProvider<NodePgDatabase> {
  private readonly pool: Pool;
  readonly client: NodePgDatabase;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.client = drizzle(this.pool);
  }

  async ping(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
