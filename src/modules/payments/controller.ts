import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentEnvironment } from "@/config/environment";
import { ApiError, errorResponse } from "@/infrastructure/http/api-error";
import { guestSession } from "@/infrastructure/http/guest-session";
import { enforceRateLimit } from "@/infrastructure/http/rate-limit";
import { paymentCustomerSchema } from "./payment.dto";
import { paymentService } from "./service";

const startSchema = z.object({
  idempotencyKey: z.uuid(),
  customer: paymentCustomerSchema,
});

const webhookSchema = z.object({
  data: z.object({ invoice_id: z.string().min(1) }),
});

function validSignature(
  body: string,
  supplied: string | null,
  secret: string,
): boolean {
  if (!supplied || !/^sha256=[a-f0-9]{64}$/i.test(supplied)) return false;

  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export class PaymentController {
  static async start(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "payment:start", 10, 3600);
      const session = guestSession(request);
      const input = startSchema.parse(await request.json());
      const payment = await paymentService.start(
        session.id,
        input.idempotencyKey,
        input.customer,
      );

      return session.attach(NextResponse.json({ payment }, { status: 201 }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async verify(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> },
  ): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "payment:verify", 30, 60);
      const session = guestSession(request);
      const { orderId } = await context.params;
      z.uuid().parse(orderId);
      const payment = await paymentService.verifyForGuest(session.id, orderId);
      return session.attach(NextResponse.json({ payment }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async retry(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> },
  ): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "payment:retry", 10, 3600);
      const session = guestSession(request);
      const { orderId } = await context.params;
      z.uuid().parse(orderId);
      const customer = paymentCustomerSchema.parse(await request.json());
      const payment = await paymentService.retryForGuest(
        session.id,
        orderId,
        customer,
      );
      return session.attach(NextResponse.json({ payment }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async webhook(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "payment:webhook", 120, 60);
      const { NODELA_WEBHOOK_SECRET } = getPaymentEnvironment();
      if (!NODELA_WEBHOOK_SECRET) {
        throw new ApiError(503, "Webhook is not configured");
      }

      const body = await request.text();
      if (
        !validSignature(
          body,
          request.headers.get("x-nodela-signature"),
          NODELA_WEBHOOK_SECRET,
        )
      ) {
        throw new ApiError(401, "Invalid webhook signature");
      }

      const event = webhookSchema.parse(JSON.parse(body));
      await paymentService.verifyForWebhook(event.data.invoice_id);
      return NextResponse.json({ received: true });
    } catch (error) {
      return errorResponse(error);
    }
  }
}
