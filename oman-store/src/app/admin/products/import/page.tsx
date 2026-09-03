import { db } from "@/lib/db";
import { ImportProductForm } from "@/components/admin/ImportProductForm";

// Forces runtime rendering — this page depends on the database/session
// at request time and must never be statically prerendered at build time
// (static prerendering of DB/auth-dependent pages caused build hangs on Render).
export const dynamic = "force-dynamic";

export default async function ImportProductPage() {
  const categories = await db.category.findMany({ select: { id: true, name: true } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">استيراد منتج من رابط</h1>
      <ImportProductForm categories={categories} />
    </div>
  );
}
