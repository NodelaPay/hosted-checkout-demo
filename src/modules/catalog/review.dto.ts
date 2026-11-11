export interface ReviewDto {
  readonly id: string;
  readonly productId: string;
  readonly authorName: string;
  readonly rating: number;
  readonly body: string;
  readonly createdAt: string;
}

export interface ReviewInput {
  readonly authorName: string;
  readonly rating: number;
  readonly body: string;
}
