import type { Order } from "@prisma/client";

export type PaymentStatusResult = "PAID" | "UNPAID" | "FAILED";

export interface CheckoutSession {
  redirectUrl: string;
  sessionId: string;
}

export interface PaymentProvider {
  createCheckoutSession(order: Order): Promise<CheckoutSession>;
  verifyPayment(sessionId: string): Promise<PaymentStatusResult>;
}
