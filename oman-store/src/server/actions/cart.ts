"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getOrCreateCart(userId: string) {
  return db.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function addToCart(productId: string, quantity = 1) {
  const session = await auth();
  if (!session?.user) return { error: "يجب تسجيل الدخول أولاً" as const };

  const cart = await getOrCreateCart((session.user as any).id);

  const existing = await db.cartItem.findFirst({ where: { cartId: cart.id, productId } });
  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await db.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  }

  revalidatePath("/cart");
  return { success: true as const };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await db.cartItem.delete({ where: { id: itemId } });
  } else {
    await db.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  revalidatePath("/cart");
}

export async function removeCartItem(itemId: string) {
  await db.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/cart");
}

export async function getCart() {
  const session = await auth();
  if (!session?.user) return null;

  return db.cart.findUnique({
    where: { userId: (session.user as any).id },
    include: { items: { include: { product: { include: { images: true } } } } },
  });
}
