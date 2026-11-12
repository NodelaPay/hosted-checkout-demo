import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { after, before, test } from "node:test";
import type {
  AddressDto,
  OrderDto,
} from "../src/modules/checkout/checkout.dto";
import type { NewPayment } from "../src/modules/payments/payment.entity";
import { NodelaPaymentProvider } from "../src/modules/payments/provider.nodela";
import type {
  PaymentRecord,
  PaymentRepository,
} from "../src/modules/payments/repository.contract";
import { PaymentService } from "../src/modules/payments/service";

const address: AddressDto = {
  id: randomUUID(),
  label: "Home",
  tag: "HOME",
  street: "12 Example Street",
  city: "Lagos",
  phone: "+2348000000000",
};

const guestId = randomUUID();
const orderId = randomUUID();
const idempotencyKey = randomUUID();
let orderStatus: OrderDto["status"] = "pending_payment";
let invoiceStatus: "pending" | "paid" = "pending";
let verifyAmount = 125;
let invoiceCalls = 0;
let rejectNextInvoice = true;
let invoiceRequest: Record<string, unknown> = {};
let checkoutUrl =
  "https://pay.nodela.co/test/checkout?invoice_id=NOD_TEST_INV_123";
let serverUrl = "";
let reference = "";

const server = createServer(async (request, response) => {
  response.setHeader("content-type", "application/json");
  if (request.headers["x-api-key"] !== "nk_test_mock") {
    response.writeHead(401).end(JSON.stringify({ success: false }));
    return;
  }

  if (request.method === "POST" && request.url === "/v1/invoices") {
    invoiceCalls += 1;
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    invoiceRequest = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    reference = String(invoiceRequest.reference);
    if (rejectNextInvoice) {
      rejectNextInvoice = false;
      response.writeHead(503).end(JSON.stringify({ success: false }));
      return;
    }
    response.writeHead(201).end(
      JSON.stringify({
        success: true,
        data: {
          invoice_id: "NOD_TEST_INV_123",
          checkout_url: checkoutUrl,
          client_secret: "cs_test_should_not_appear_in_logs",
          original_amount: 125,
          original_currency: "USD",
        },
      }),
    );
    return;
  }

  if (
    request.method === "GET" &&
    request.url === "/v1/invoices/NOD_TEST_INV_123/verify"
  ) {
    response.writeHead(200).end(
      JSON.stringify({
        success: true,
        data: {
          invoice_id: "NOD_TEST_INV_123",
          reference,
          original_amount: verifyAmount,
          original_currency: "USD",
          status: invoiceStatus,
          paid: invoiceStatus === "paid",
        },
      }),
    );
    return;
  }

  response.writeHead(404).end(JSON.stringify({ success: false }));
});

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const location = server.address();
  if (!location || typeof location === "string") {
    throw new Error("Mock Nodela server did not start");
  }
  serverUrl = `http://127.0.0.1:${location.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

class MemoryPaymentRepository implements PaymentRepository {
  private record: PaymentRecord | undefined;

  async claim(input: NewPayment): Promise<PaymentRecord> {
    this.record ??= {
      ...input,
      invoiceId: null,
      checkoutUrl: null,
      status: "creating",
    };
    return this.record;
  }

  async getByOrder(id: string): Promise<PaymentRecord | undefined> {
    return this.record?.orderId === id ? this.record : undefined;
  }

  async getByInvoice(id: string): Promise<PaymentRecord | undefined> {
    return this.record?.invoiceId === id ? this.record : undefined;
  }

  async setInvoice(
    id: string,
    invoiceId: string,
    checkoutUrl: string,
  ): Promise<PaymentRecord> {
    assert.equal(this.record?.id, id);
    this.record = { ...this.record, invoiceId, checkoutUrl, status: "pending" };
    return this.record;
  }

  async setStatus(id: string, status: PaymentRecord["status"]): Promise<void> {
    assert.equal(this.record?.id, id);
    this.record = { ...this.record, status };
  }

  async retryFailed(id: string): Promise<boolean> {
    if (this.record?.id !== id || this.record.status !== "failed") return false;
    this.record = { ...this.record, status: "creating" };
    return true;
  }
}

const repository = new MemoryPaymentRepository();
const checkout = {
  async createOrder(
    requestGuestId: string,
    requestKey: string,
  ): Promise<OrderDto> {
    assert.equal(requestGuestId, guestId);
    assert.equal(requestKey, idempotencyKey);
    const order = await this.getOrder(requestGuestId, orderId);
    if (!order) throw new Error("Test order is missing");
    return order;
  },
  async getOrder(
    requestGuestId: string,
    requestOrderId: string,
  ): Promise<OrderDto | undefined> {
    if (requestGuestId !== guestId || requestOrderId !== orderId)
      return undefined;
    return {
      id: orderId,
      status: orderStatus,
      address,
      items: [
        {
          productId: "test-product",
          name: "Test product",
          unitPrice: 125,
          quantity: 1,
        },
      ],
      shippingMethod: "free",
      subtotal: 125,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 125,
      promoCode: null,
      scheduledDate: null,
      createdAt: new Date().toISOString(),
    };
  },
  async markOrderPaid(requestOrderId: string): Promise<void> {
    assert.equal(requestOrderId, orderId);
    orderStatus = "paid";
  },
};

function service(): PaymentService {
  return new PaymentService(
    repository,
    checkout,
    () =>
      new NodelaPaymentProvider(
        "nk_test_mock",
        serverUrl,
        "http://localhost:3000",
        false,
      ),
  );
}

test("creates one USD invoice and reuses it for repeated requests", async () => {
  await assert.rejects(
    service().start(guestId, idempotencyKey, {
      name: "Test Customer",
      email: "customer@example.com",
    }),
  );
  assert.equal((await repository.getByOrder(orderId))?.status, "failed");

  const payment = await service().retryForGuest(guestId, orderId, {
    name: "Test Customer",
    email: "customer@example.com",
  });
  assert.equal(payment.status, "pending");
  assert.equal(invoiceCalls, 2);
  assert.equal(invoiceRequest.amount, 125);
  assert.equal(invoiceRequest.currency, "USD");
  assert.equal(
    invoiceRequest.success_url,
    `http://localhost:3000/checkout/return?orderId=${orderId}`,
  );
  assert.equal(
    invoiceRequest.cancel_url,
    `http://localhost:3000/checkout/cancel?orderId=${orderId}`,
  );
  assert.equal(invoiceRequest.webhook_url, undefined);

  const repeated = await service().start(guestId, idempotencyKey, {
    name: "Test Customer",
    email: "customer@example.com",
  });
  assert.equal(repeated.invoiceId, payment.invoiceId);
  assert.equal(invoiceCalls, 2);
});

test("rejects a paid verification with a mismatched amount", async () => {
  invoiceStatus = "paid";
  verifyAmount = 124;
  await assert.rejects(service().verifyForGuest(guestId, orderId));
  assert.equal(orderStatus, "pending_payment");
});

test("marks the order paid only after a matching verification", async () => {
  verifyAmount = 125;
  const payment = await service().verifyForGuest(guestId, orderId);
  assert.equal(payment.status, "paid");
  assert.equal(orderStatus, "paid");
  assert.equal((await repository.getByOrder(orderId))?.status, "paid");
});

test("logs redacted responses and rejects an unrelated checkout host", async () => {
  const messages: unknown[][] = [];
  const original = console.info;
  console.info = (...values: unknown[]) => messages.push(values);

  try {
    checkoutUrl =
      "https://unrelated.example/checkout?invoice_id=NOD_TEST_INV_123";
    const provider = new NodelaPaymentProvider(
      "nk_test_mock",
      serverUrl,
      "http://localhost:3000",
      false,
      true,
    );

    await assert.rejects(
      provider.createInvoice({
        amount: 125,
        reference: `test-${randomUUID()}`,
        orderId,
        customer: { name: "Test Customer", email: "customer@example.com" },
      }),
    );

    const output = JSON.stringify(messages);
    assert.match(output, /unrelated\.example/);
    assert.doesNotMatch(output, /cs_test_should_not_appear_in_logs/);
    assert.doesNotMatch(output, /customer@example\.com/);
    assert.doesNotMatch(output, /Test Customer/);
  } finally {
    checkoutUrl =
      "https://pay.nodela.co/test/checkout?invoice_id=NOD_TEST_INV_123";
    console.info = original;
  }
});
