import type { PaymentProvider } from "./types";
import { ThawaniProvider } from "./thawani";
import { MockProvider } from "./mock";

// Swapping providers later (or adding a second one) never touches the
// Order/Checkout code — it only depends on the PaymentProvider interface.
export function getPaymentProvider(): PaymentProvider {
  const mode = process.env.PAYMENT_MODE ?? "mock";
  if (mode === "mock") return new MockProvider();
  return new ThawaniProvider();
}
