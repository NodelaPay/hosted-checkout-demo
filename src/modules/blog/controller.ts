import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { errorResponse } from "@/infrastructure/http/api-error";
import { blogService } from "./service";

export class BlogController {
  static async list(): Promise<NextResponse> {
    try {
      const posts = await blogService.list();
      return NextResponse.json({ posts });
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async get(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> },
  ): Promise<NextResponse> {
    try {
      const { slug } = await context.params;
      const post = await blogService.getBySlug(slug);
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ post });
    } catch (error) {
      return errorResponse(error);
    }
  }
}
