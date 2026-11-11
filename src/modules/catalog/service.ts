import { z } from "zod";
import type { CacheProvider } from "@/infrastructure/cache/contract";
import { CacheProviderFactory } from "@/infrastructure/cache/factory";
import type { ProductDto } from "./product.dto";
import type { ProductRepository } from "./repository.contract";
import { ProductRepositoryFactory } from "./repository.factory";

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  price: z.number().int(),
  oldPrice: z.number().int().optional(),
  image: z.string(),
  category: z.enum([
    "Phones",
    "Computers",
    "Smart Watches",
    "Headphones",
    "Accessories",
  ]),
  brand: z.string(),
  color: z.string(),
  memory: z.string().optional(),
});

export interface CatalogServiceContract {
  list(): Promise<readonly ProductDto[]>;
  getById(id: string): Promise<ProductDto | undefined>;
}

export class CatalogService implements CatalogServiceContract {
  constructor(
    private readonly repository: ProductRepository,
    private readonly cache: CacheProvider,
  ) {}

  async list(): Promise<readonly ProductDto[]> {
    const cacheKey = "catalog:products:v1";
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        const parsed = z.array(productSchema).safeParse(JSON.parse(cached));
        if (parsed.success) return parsed.data;
      }
    } catch (error) {
      console.error("Catalog cache read failed", error);
    }

    const products = await this.repository.list();
    try {
      await this.cache.set(cacheKey, JSON.stringify(products), 60);
    } catch (error) {
      console.error("Catalog cache write failed", error);
    }
    return products;
  }

  async getById(id: string): Promise<ProductDto | undefined> {
    const products = await this.list();
    return products.find((product) => product.id === id);
  }
}

export const catalogService: CatalogServiceContract = new CatalogService(
  ProductRepositoryFactory.create(),
  CacheProviderFactory.create(),
);
