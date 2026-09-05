"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateStoreSettings(formData: FormData) {
  const storeName = formData.get("storeName") as string;
  const storeDescription = (formData.get("storeDescription") as string) || null;
  const contactPhone = (formData.get("contactPhone") as string) || null;
  const contactEmail = (formData.get("contactEmail") as string) || null;

  await db.storeSetting.upsert({
    where: { id: "singleton" },
    update: { storeName, storeDescription, contactPhone, contactEmail },
    create: { id: "singleton", storeName, storeDescription, contactPhone, contactEmail },
  });

  revalidatePath("/admin/settings");
}

export async function upsertShippingFee(formData: FormData) {
  const governorate = formData.get("governorate") as string;
  const fee = Number(formData.get("fee"));

  await db.shippingSetting.upsert({
    where: { governorate },
    update: { fee },
    create: { governorate, fee },
  });

  revalidatePath("/admin/settings");
}
