import { getDatabaseProvider } from "@/infrastructure/database/factory";
import type { ReviewRepository } from "./review-repository.contract";
import { PostgreSqlReviewRepository } from "./review-repository.postgresql";

export class ReviewRepositoryFactory {
  static create(): ReviewRepository {
    return new PostgreSqlReviewRepository(getDatabaseProvider().client);
  }
}
