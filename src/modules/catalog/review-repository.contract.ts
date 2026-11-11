import type { ReviewDto, ReviewInput } from "./review.dto";

export interface ReviewRepository {
  list(productId: string): Promise<readonly ReviewDto[]>;
  save(
    productId: string,
    guestId: string,
    input: ReviewInput,
  ): Promise<ReviewDto>;
}
