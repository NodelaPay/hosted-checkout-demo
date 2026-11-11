import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

class ApiClient {
  private cookie = "";

  async request(
    path: string,
    method = "GET",
    body?: object,
  ): Promise<{ status: number; data: unknown }> {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(this.cookie ? { cookie: this.cookie } : {}),
        ...(body ? { "content-type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const cookie = response.headers.get("set-cookie")?.split(";")[0];
    if (cookie) this.cookie = cookie;

    return { status: response.status, data: await response.json() };
  }
}

async function main(): Promise<void> {
  const client = new ApiClient();
  const otherGuest = new ApiClient();

  assert.equal((await client.request("/api/session")).status, 200);
  assert.equal((await client.request("/api/products")).status, 200);
  assert.equal((await client.request("/api/blog")).status, 200);

  const invalidCart = await client.request("/api/cart", "PUT", {
    productId: "iphone-14-pro-max",
    quantity: -1,
  });
  assert.equal(invalidCart.status, 400);

  const cartUpdate = await client.request("/api/cart", "PUT", {
    productId: "iphone-14-pro-max",
    quantity: 2,
  });
  assert.equal(cartUpdate.status, 200);
  const cart = z
    .object({
      items: z.array(z.object({ productId: z.string(), quantity: z.number() })),
    })
    .parse((await client.request("/api/cart")).data);
  assert.deepEqual(cart.items, [
    { productId: "iphone-14-pro-max", quantity: 2 },
  ]);

  await otherGuest.request("/api/session");
  const otherCart = z
    .object({ items: z.array(z.unknown()) })
    .parse((await otherGuest.request("/api/cart")).data);
  assert.equal(otherCart.items.length, 0);

  assert.equal(
    (
      await client.request("/api/favorites", "PUT", {
        productId: "iphone-14-pro-max",
        favorite: true,
      })
    ).status,
    200,
  );

  const addressResponse = await client.request(
    "/api/checkout/addresses",
    "POST",
    {
      label: "Test address",
      tag: "HOME",
      street: "12 Example Street",
      city: "Lagos",
      phone: "+234 800 000 0000",
    },
  );
  assert.equal(addressResponse.status, 201);
  const address = z
    .object({ address: z.object({ id: z.uuid() }) })
    .parse(addressResponse.data).address;

  assert.equal(
    (
      await client.request("/api/checkout", "PUT", {
        addressId: address.id,
        shippingMethod: "express",
        promoCode: null,
        scheduledDate: null,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await client.request("/api/checkout/promo", "PUT", {
        promoCode: "CYBER10",
      })
    ).status,
    200,
  );

  const quote = z
    .object({
      quote: z.object({
        subtotal: z.number(),
        discount: z.number(),
        shipping: z.number(),
        total: z.number(),
      }),
    })
    .parse((await client.request("/api/checkout/quote")).data).quote;
  assert.deepEqual(quote, {
    subtotal: 2798,
    discount: 280,
    shipping: 9,
    total: 2577,
  });

  const idempotencyKey = randomUUID();
  const orderResponse = await client.request("/api/orders", "POST", {
    idempotencyKey,
  });
  assert.equal(orderResponse.status, 201);
  const order = z
    .object({
      order: z.object({ id: z.uuid(), status: z.literal("pending_payment") }),
    })
    .parse(orderResponse.data).order;
  const replay = z
    .object({ order: z.object({ id: z.uuid() }) })
    .parse(
      (await client.request("/api/orders", "POST", { idempotencyKey })).data,
    );
  assert.equal(replay.order.id, order.id);

  const emptyCart = z
    .object({ items: z.array(z.unknown()) })
    .parse((await client.request("/api/cart")).data);
  assert.equal(emptyCart.items.length, 0);

  const contactResponse = await client.request("/api/contact", "POST", {
    firstName: "Smoke",
    lastName: "Test",
    email: "smoke@example.com",
    message: "This contact message verifies database persistence.",
  });
  assert.equal(contactResponse.status, 201);

  const reviewResponse = await client.request(
    "/api/products/iphone-14-pro-max/reviews",
    "POST",
    {
      authorName: "Smoke Test",
      rating: 5,
      body: "This review verifies database persistence.",
    },
  );
  assert.equal(reviewResponse.status, 201);

  console.info(
    "Smoke flow passed: catalog, cart, favorites, checkout, contact, reviews.",
  );
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
