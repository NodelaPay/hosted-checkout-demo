import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { errorResponse } from "@/infrastructure/http/api-error";
import { guestSession } from "@/infrastructure/http/guest-session";

export function GET(request: NextRequest): NextResponse {
  try {
    const session = guestSession(request);
    return session.attach(NextResponse.json({ ready: true }));
  } catch (error) {
    return errorResponse(error);
  }
}
