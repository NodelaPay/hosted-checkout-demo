import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/infrastructure/http/api-error";
import { guestSession } from "@/infrastructure/http/guest-session";
import { enforceRateLimit } from "@/infrastructure/http/rate-limit";
import { cartService } from "./service";

const itemSchema = z.object({
  productId: z.string().min(1).max(100),
  quantity: z.number().int().min(0).max(99),
});

export class CartController {
  static async get(request: NextRequest): Promise<NextResponse> {
    try {
      const session = guestSession(request);
      const items = await cartService.list(session.id);
      return session.attach(NextResponse.json({ items }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async put(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "cart:write", 60, 60);
      const session = guestSession(request);
      const input = itemSchema.parse(await request.json());
      await cartService.set(session.id, input.productId, input.quantity);
      const items = await cartService.list(session.id);
      return session.attach(NextResponse.json({ items }));
    } catch (error) {
      return errorResponse(error);
    }
  }
}
