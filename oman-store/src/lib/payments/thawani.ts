import type { Order } from "@prisma/client";
import type { PaymentProvider, CheckoutSession, PaymentStatusResult } from "./types";

/**
 * Thawani Pay — an Oman-based gateway supporting Visa/Mastercard and OMR
 * natively, PCI-compliant hosted checkout (card data never touches our
 * server or database). Docs: https://thawani.om
 *
 * Requires THAWANI_SECRET_KEY, THAWANI_PUBLISHABLE_KEY, THAWANI_BASE_URL
 * in .env (see .env.example). Uses the sandbox URL by default.
 */
export class ThawaniProvider implements PaymentProvider {
  private baseUrl = process.env.THAWANI_BASE_URL!;
  private secretKey = process.env.THAWANI_SECRET_KEY!;

  async createCheckoutSession(order: Order): Promise<CheckoutSession> {
    const res = await fetch(`${this.baseUrl}/checkout/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "thawani-api-key": this.secretKey,
      },
      body: JSON.stringify({
        client_reference_id: order.id,
        mode: "payment",
        products: [
          {
            name: `طلب ${order.orderNumber}`,
            unit_amount: Math.round(Number(order.total) * 1000), // baisa
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.orderNumber}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?failed=1`,
      }),
    });

    if (!res.ok) throw new Error("تعذر إنشاء جلسة الدفع");

    const json = await res.json();
    const sessionId = json.data.session_id as string;

    return {
      sessionId,
      redirectUrl: `https://checkout.thawani.om/pay/${sessionId}?key=${process.env.THAWANI_PUBLISHABLE_KEY}`,
    };
  }

  async verifyPayment(sessionId: string): Promise<PaymentStatusResult> {
    const res = await fetch(`${this.baseUrl}/checkout/session/${sessionId}`, {
      headers: { "thawani-api-key": this.secretKey },
    });
    if (!res.ok) return "FAILED";
    const json = await res.json();
    return json.data.payment_status === "paid" ? "PAID" : "UNPAID";
  }
}
