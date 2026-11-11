import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/infrastructure/http/api-error";
import { guestSession } from "@/infrastructure/http/guest-session";
import { enforceRateLimit } from "@/infrastructure/http/rate-limit";
import { addressInputSchema, shippingMethodSchema } from "./checkout.dto";
import { checkoutService } from "./service";

const draftSchema = z.object({
  addressId: z.uuid().nullable(),
  shippingMethod: shippingMethodSchema,
  promoCode: z.string().nullable(),
  scheduledDate: z.iso.date().nullable(),
});

const orderSchema = z.object({
  idempotencyKey: z.uuid(),
});

const promoSchema = z.object({
  promoCode: z.string().trim().toUpperCase().max(30).nullable(),
});

export class CheckoutController {
  static async get(request: NextRequest): Promise<NextResponse> {
    try {
      const session = guestSession(request);
      const [addresses, draft] = await Promise.all([
        checkoutService.listAddresses(session.id),
        checkoutService.getDraft(session.id),
      ]);
      return session.attach(NextResponse.json({ addresses, draft }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async saveAddress(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "checkout:address", 30, 60);
      const session = guestSession(request);
      const input = addressInputSchema.parse(await request.json());
      const address = await checkoutService.saveAddress(session.id, input);
      return session.attach(NextResponse.json({ address }, { status: 201 }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async updateAddress(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "checkout:address", 30, 60);
      const session = guestSession(request);
      const { id } = await context.params;
      z.uuid().parse(id);
      const input = addressInputSchema.parse(await request.json());
      const address = await checkoutService.saveAddress(session.id, input, id);
      return session.attach(NextResponse.json({ address }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async deleteAddress(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "checkout:address", 30, 60);
      const session = guestSession(request);
      const { id } = await context.params;
      z.uuid().parse(id);
      await checkoutService.deleteAddress(session.id, id);
      return session.attach(NextResponse.json({ deleted: true }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async saveDraft(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "checkout:draft", 30, 60);
      const session = guestSession(request);
      const input = draftSchema.parse(await request.json());
      await checkoutService.saveDraft(session.id, input);
      return session.attach(NextResponse.json({ draft: input }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async quote(request: NextRequest): Promise<NextResponse> {
    try {
      const session = guestSession(request);
      const quote = await checkoutService.quote(session.id);
      return session.attach(NextResponse.json({ quote }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async savePromo(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "checkout:promo", 20, 60);
      const session = guestSession(request);
      const input = promoSchema.parse(await request.json());
      await checkoutService.setPromo(session.id, input.promoCode);
      const quote = await checkoutService.quote(session.id);
      return session.attach(NextResponse.json({ quote }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async listOrders(request: NextRequest): Promise<NextResponse> {
    try {
      const session = guestSession(request);
      const orders = await checkoutService.listOrders(session.id);
      return session.attach(NextResponse.json({ orders }));
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async createOrder(request: NextRequest): Promise<NextResponse> {
    try {
      await enforceRateLimit(request, "checkout:order", 10, 3600);
      const session = guestSession(request);
      const input = orderSchema.parse(await request.json());
      const order = await checkoutService.createOrder(
        session.id,
        input.idempotencyKey,
      );
      return session.attach(NextResponse.json({ order }, { status: 201 }));
    } catch (error) {
      return errorResponse(error);
    }
  }
}
