import type { Order } from "@prisma/client";
import type { PaymentProvider, CheckoutSession, PaymentStatusResult } from "./types";

/**
 * Local development/demo provider. No external calls, no real money.
 * Lets you exercise the full Cart → Checkout → Order flow before adding
 * real Thawani credentials. Every session "succeeds" instantly.
 */
export class MockProvider implements PaymentProvider {
  async createCheckoutSession(order: Order): Promise<CheckoutSession> {
    return {
      sessionId: `mock_${order.id}`,
      redirectUrl: `/checkout/success?order=${order.orderNumber}&mock=1`,
    };
  }

  async verifyPayment(): Promise<PaymentStatusResult> {
    return "PAID";
  }
}
