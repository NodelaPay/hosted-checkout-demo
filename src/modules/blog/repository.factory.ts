import { getDatabaseProvider } from "@/infrastructure/database/factory";
import type { BlogRepository } from "./repository.contract";
import { PostgreSqlBlogRepository } from "./repository.postgresql";

export class BlogRepositoryFactory {
  static create(): BlogRepository {
    return new PostgreSqlBlogRepository(getDatabaseProvider().client);
  }
}
