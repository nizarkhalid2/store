"use server";

import { db } from "@/lib/db";
import { resolveImporter } from "@/lib/importers/registry";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Step 1 of the import flow: resolve the source, attempt to fetch data,
 * and log the attempt. Never publishes anything — that only happens when
 * the admin explicitly submits publishProduct() after reviewing the preview.
 */
export async function importProductFromUrl(url: string) {
  const importer = resolveImporter(url);

  if (!importer) {
    await db.productImport.create({
      data: { sourceUrl: url, source: "MANUAL", status: "FAILED", errorMessage: "الرابط غير مدعوم" },
    });
    return { status: "UNSUPPORTED" as const, message: "هذا الرابط غير مدعوم حاليًا (Temu/AliExpress فقط)." };
  }

  const result = await importer.fetchProduct(url);

  await db.productImport.create({
    data: {
      sourceUrl: url,
      source: importer.source,
      status: result.status === "SUCCESS" ? "SUCCESS" : result.status === "MANUAL_FALLBACK" ? "MANUAL_FALLBACK" : "FAILED",
      rawPayload: result.status === "SUCCESS" ? (result.data as any) : undefined,
      errorMessage: result.status !== "SUCCESS" ? result.reason : undefined,
    },
  });

  return result.status === "SUCCESS"
    ? { status: "SUCCESS" as const, data: result.data, source: importer.source }
    : { status: "MANUAL" as const, message: result.reason, source: importer.source };
}

/**
 * Step 2: admin reviews/edits the preview (or fills it manually), sets the
 * selling price and category, and publishes. Selling price is completely
 * independent of any supplier price — exactly as required.
 */
export async function publishProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sellingPrice = Number(formData.get("sellingPrice"));
  const originalPrice = formData.get("originalPrice")
    ? Number(formData.get("originalPrice"))
    : null;
  const categoryId = formData.get("categoryId") as string;
  const supplierUrl = (formData.get("supplierUrl") as string) || null;
  const supplierPrice = formData.get("supplierPrice")
    ? Number(formData.get("supplierPrice"))
    : null;
  const importSource = (formData.get("importSource") as "TEMU" | "ALIEXPRESS" | "MANUAL") || "MANUAL";
  const images = (formData.get("images") as string).split("\n").map((s) => s.trim()).filter(Boolean);
  const stock = Number(formData.get("stock") ?? 0);

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) + "-" + Math.random().toString(36).slice(2, 6);

  const sku = `SKU-${Date.now().toString(36).toUpperCase()}`;

  const discountPct =
    originalPrice && originalPrice > sellingPrice
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : null;

  const product = await db.product.create({
    data: {
      name,
      slug,
      description,
      sku,
      sellingPrice,
      originalPrice,
      discountPct,
      stock,
      categoryId,
      supplierUrl,
      supplierPrice,
      importSource,
      isPublished: true,
      images: { create: images.map((url, i) => ({ url, position: i })) },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect(`/products/${product.slug}?published=1`);
}
