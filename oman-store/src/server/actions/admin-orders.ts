"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = [
  "PENDING", "PAID", "PROCESSING", "ORDERED_FROM_SUPPLIER",
  "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED",
] as const;

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const status = formData.get("status") as string;
  if (!VALID_STATUSES.includes(status as any)) return;

  const order = await db.order.update({
    where: { id: orderId },
    data: { status: status as any },
  });

  const statusMessages: Record<string, string> = {
    SHIPPED: `تم شحن طلبك رقم ${order.orderNumber}`,
    DELIVERED: `تم توصيل طلبك رقم ${order.orderNumber}`,
    CANCELLED: `تم إلغاء طلبك رقم ${order.orderNumber}`,
  };

  if (statusMessages[status]) {
    await db.notification.create({
      data: {
        userId: order.userId,
        type: status === "SHIPPED" ? "ORDER_SHIPPED" : status === "DELIVERED" ? "ORDER_DELIVERED" : "GENERIC",
        message: statusMessages[status],
      },
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account");
}
