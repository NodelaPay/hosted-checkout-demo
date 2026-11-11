import type { ProductDto } from "./product.dto";

export interface ProductRepository {
  list(): Promise<readonly ProductDto[]>;
  getById(id: string): Promise<ProductDto | undefined>;
}
