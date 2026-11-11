import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/infrastructure/http/api-error";
import { catalogService } from "./service";

const querySchema = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  brand: z.string().max(80).optional(),
  memory: z.string().max(30).optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
});

export class CatalogController {
  static async list(request: NextRequest): Promise<NextResponse> {
    try {
      const query = querySchema.parse(
        Object.fromEntries(request.nextUrl.searchParams.entries()),
      );
      const allProducts = await catalogService.list();
      const products = allProducts.filter((product) => {
        if (
          query.q &&
          !product.name.toLowerCase().includes(query.q.toLowerCase())
        ) {
          return false;
        }
        if (query.category && product.category !== query.category) return false;
        if (query.brand && product.brand !== query.brand) return false;
        if (query.memory && product.memory !== query.memory) return false;
        if (query.min !== undefined && product.price < query.min) return false;
        if (query.max !== undefined && product.price > query.max) return false;
        return true;
      });
      return NextResponse.json({ products });
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async get(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ): Promise<NextResponse> {
    try {
      const { id } = await context.params;
      const product = await catalogService.getById(id);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ product });
    } catch (error) {
      return errorResponse(error);
    }
  }
}
