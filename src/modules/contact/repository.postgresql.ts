import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { contactMessagesTable } from "./contact.table";
import type { ContactMessageInput } from "./contact.dto";
import type { ContactRepository } from "./repository.contract";

export class PostgreSqlContactRepository implements ContactRepository {
  constructor(private readonly database: NodePgDatabase) {}

  async save(input: ContactMessageInput): Promise<string> {
    const [row] = await this.database
      .insert(contactMessagesTable)
      .values(input)
      .returning({ id: contactMessagesTable.id });

    if (!row) throw new Error("Contact message was not saved");
    return row.id;
  }
}
