import { getDatabaseProvider } from "@/infrastructure/database/factory";
import type { ContactRepository } from "./repository.contract";
import { PostgreSqlContactRepository } from "./repository.postgresql";

export class ContactRepositoryFactory {
  static create(): ContactRepository {
    return new PostgreSqlContactRepository(getDatabaseProvider().client);
  }
}
