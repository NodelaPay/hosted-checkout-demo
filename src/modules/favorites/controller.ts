import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/infrastructure/http/api-error";
import { guestSession } from "@/infrastructure/http/guest-session";
import { enforceRateLimit } from "@/infrastructure/http/rate-limit";
import { favoritesService } from "./service";

const inputSchema = z.object({
  productId: z.string().min(1).max(100),
  favorite: z.boolean(),
});

export class FavoritesController {
  static async get(request: NextRequest): Promise<NextResponse> {
    try {
      const session = guestSession(request);
      const productIds = await favoritesService.list(session.id);
      return session.attach(NextResponse.json({ productIds }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async put(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "favorites:write", 60, 60);
      const session = guestSession(request);
      const input = inputSchema.parse(await request.json());
      await favoritesService.set(session.id, input.productId, input.favorite);
      const productIds = await favoritesService.list(session.id);
      return session.attach(NextResponse.json({ productIds }));
    } catch (error) {
      return errorResponse(error);
    }
  }
}
