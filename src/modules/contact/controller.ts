import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/infrastructure/http/api-error";
import { enforceRateLimit } from "@/infrastructure/http/rate-limit";
import { contactService } from "./service";

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
});

export class ContactController {
  static async post(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "contact:submit", 5, 3600);
      const input = contactSchema.parse(await request.json());
      const id = await contactService.submit(input);
      return NextResponse.json({ id, status: "received" }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  }
}
