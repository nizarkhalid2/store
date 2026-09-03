"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export async function registerCustomer(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "هذا البريد الإلكتروني مستخدم بالفعل" as const };

  const passwordHash = await bcrypt.hash(password, 10);

  await db.user.create({
    data: { fullName, email, phone, passwordHash, role: "CUSTOMER" },
  });

  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  await signIn("credentials", { email, password, redirectTo: callbackUrl });
}
