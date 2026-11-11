import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/infrastructure/http/api-error";
import { guestSession } from "@/infrastructure/http/guest-session";
import { enforceRateLimit } from "@/infrastructure/http/rate-limit";
import { reviewService } from "./review.service";

const reviewSchema = z.object({
  authorName: z.string().trim().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
});

export class ReviewController {
  static async get(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ): Promise<NextResponse> {
    try {
      const { id } = await context.params;
      const reviews = await reviewService.list(id);
      return NextResponse.json({ reviews });
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async post(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "reviews:submit", 10, 3600);
      const session = guestSession(request);
      const { id } = await context.params;
      const input = reviewSchema.parse(await request.json());
      const review = await reviewService.save(id, session.id, input);
      return session.attach(NextResponse.json({ review }, { status: 201 }));
    } catch (error) {
      return errorResponse(error);
    }
  }
}
