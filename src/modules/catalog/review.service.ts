import { DomainError } from "@/shared/domain-error";
import type { ReviewDto, ReviewInput } from "./review.dto";
import type { ReviewRepository } from "./review-repository.contract";
import { ReviewRepositoryFactory } from "./review-repository.factory";
import { catalogService, type CatalogServiceContract } from "./service";

export interface ReviewServiceContract {
  list(productId: string): Promise<readonly ReviewDto[]>;
  save(
    productId: string,
    guestId: string,
    input: ReviewInput,
  ): Promise<ReviewDto>;
}

export class ReviewService implements ReviewServiceContract {
  constructor(
    private readonly repository: ReviewRepository,
    private readonly catalog: CatalogServiceContract,
  ) {}

  async list(productId: string): Promise<readonly ReviewDto[]> {
    if (!(await this.catalog.getById(productId))) {
      throw new DomainError("not_found", "Product not found");
    }
    return this.repository.list(productId);
  }

  async save(
    productId: string,
    guestId: string,
    input: ReviewInput,
  ): Promise<ReviewDto> {
    if (!(await this.catalog.getById(productId))) {
      throw new DomainError("not_found", "Product not found");
    }
    return this.repository.save(productId, guestId, input);
  }
}

export const reviewService: ReviewServiceContract = new ReviewService(
  ReviewRepositoryFactory.create(),
  catalogService,
);
