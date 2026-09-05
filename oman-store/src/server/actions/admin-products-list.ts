"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function togglePublish(productId: string, isPublished: boolean) {
  await db.product.update({ where: { id: productId }, data: { isPublished: !isPublished } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  await db.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
