import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionEnvironment } from "@/config/environment";

const COOKIE_NAME = "cyber_guest";
const COOKIE_AGE_SECONDS = 60 * 60 * 24 * 90;

function secret(): string {
  return getSessionEnvironment().SESSION_SECRET;
}

function signature(id: string): string {
  return createHmac("sha256", secret()).update(id).digest("hex");
}

function readGuestId(request: NextRequest): string | undefined {
  const value = request.cookies.get(COOKIE_NAME)?.value;
  if (!value) return undefined;

  const [id, suppliedSignature] = value.split(".");
  if (!id || !suppliedSignature || !/^[0-9a-f-]{36}$/.test(id)) {
    return undefined;
  }

  const expected = Buffer.from(signature(id), "hex");
  const supplied = Buffer.from(suppliedSignature, "hex");

  if (expected.length !== supplied.length) return undefined;
  return timingSafeEqual(expected, supplied) ? id : undefined;
}

export interface GuestSession {
  readonly id: string;
  attach(response: NextResponse): NextResponse;
}

export function guestSession(request: NextRequest): GuestSession {
  const existingId = readGuestId(request);
  const id = existingId ?? randomUUID();
  const secure =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  return {
    id,
    attach(response) {
      if (!existingId) {
        response.cookies.set(COOKIE_NAME, `${id}.${signature(id)}`, {
          httpOnly: true,
          sameSite: "lax",
          secure,
          path: "/",
          maxAge: COOKIE_AGE_SECONDS,
        });
      }

      return response;
    },
  };
}
