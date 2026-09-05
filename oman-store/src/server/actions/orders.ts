"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payments";
import { redirect } from "next/navigation";

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OM-${date}-${rand}`;
}

const GOVERNORATE_SHIPPING_FALLBACK = 2; // OMR, used only if ShippingSetting row is missing

export async function createOrderAndCheckout(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  const userId = (session.user as any).id as string;

  const addressId = formData.get("addressId") as string;
  const governorate = formData.get("governorate") as string;

  const cart = await db.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) redirect("/cart");

  // Prices are always read fresh from the Product table server-side —
  // never trusted from the client/cart snapshot.
  const subtotal = cart!.items.reduce(
    (sum, item) => sum + Number(item.product.sellingPrice) * item.quantity,
    0
  );

  const shippingSetting = await db.shippingSetting.findUnique({ where: { governorate } });
  const shippingFee = shippingSetting ? Number(shippingSetting.fee) : GOVERNORATE_SHIPPING_FALLBACK;

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId,
      addressId,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      items: {
        create: cart!.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          unitPrice: item.product.sellingPrice,
          quantity: item.quantity,
        })),
      },
    },
  });

  const provider = getPaymentProvider();
  const checkoutSession = await provider.createCheckoutSession(order);

  await db.payment.create({
    data: {
      orderId: order.id,
      provider: process.env.PAYMENT_MODE === "mock" ? "mock" : "thawani",
      providerRef: checkoutSession.sessionId,
      amount: order.total,
      status: "UNPAID",
    },
  });

  // Cart is cleared only after the order + payment session are safely
  // persisted, so a failed redirect never loses the customer's items.
  await db.cartItem.deleteMany({ where: { cartId: cart!.id } });

  redirect(checkoutSession.redirectUrl);
}

export async function confirmPayment(
  orderNumber: string
): Promise<{ error: string } | { status: "PAID" | "UNPAID" | "FAILED" }> {
  const order = await db.order.findUnique({ where: { orderNumber }, include: { payments: true } });
  if (!order) return { error: "الطلب غير موجود" };

  const provider = getPaymentProvider();
  const latestPayment = order.payments[order.payments.length - 1];
  const status = await provider.verifyPayment(latestPayment.providerRef ?? "");

  if (status === "PAID") {
    await db.$transaction([
      db.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "PAID" } }),
      db.payment.update({ where: { id: latestPayment.id }, data: { status: "PAID" } }),
      db.notification.create({
        data: {
          userId: order.userId,
          type: "PAYMENT_SUCCESS",
          message: `تم الدفع بنجاح لطلبك رقم ${order.orderNumber}`,
        },
      }),
    ]);
  }

  return { status };
}
