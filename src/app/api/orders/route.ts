import { CheckoutController } from "@/modules/checkout/controller";

export const GET = CheckoutController.listOrders;
export const POST = CheckoutController.createOrder;
