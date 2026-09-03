import { db } from "@/lib/db";
import { ImportProductForm } from "@/components/admin/ImportProductForm";

export default async function ImportProductPage() {
  const categories = await db.category.findMany({ select: { id: true, name: true } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">استيراد منتج من رابط</h1>
      <ImportProductForm categories={categories} />
    </div>
  );
}
