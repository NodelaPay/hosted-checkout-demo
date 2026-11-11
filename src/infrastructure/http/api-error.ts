import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/shared/domain-error";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly headers?: HeadersInit,
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof DomainError) {
    const status =
      error.code === "invalid_input"
        ? 400
        : error.code === "not_found"
          ? 404
          : 409;
    return NextResponse.json({ error: error.message }, { status });
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status, headers: error.headers },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request", details: error.flatten() },
      { status: 400 },
    );
  }

  console.error("API error", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
