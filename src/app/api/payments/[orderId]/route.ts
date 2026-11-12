import { PaymentController } from "@/modules/payments/controller";

export const GET = PaymentController.verify;
export const POST = PaymentController.retry;
