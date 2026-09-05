"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createAddress(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const governorate = formData.get("governorate") as string;
  const wilayat = formData.get("wilayat") as string;
  const additionalDetails = (formData.get("additionalDetails") as string) || null;

  await db.address.create({
    data: {
      userId: (session.user as any).id,
      fullName,
      phone,
      governorate,
      wilayat,
      additionalDetails,
    },
  });

  revalidatePath("/account");
  revalidatePath("/checkout");
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  // Only ever delete an address that actually belongs to the logged-in
  // user — never trust an id passed from the client alone.
  await db.address.deleteMany({
    where: { id: addressId, userId: (session.user as any).id },
  });

  revalidatePath("/account");
  revalidatePath("/checkout");
}
