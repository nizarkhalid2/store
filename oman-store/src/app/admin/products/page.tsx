import Link from "next/link";
import { db } from "@/lib/db";
import { formatOmr } from "@/lib/currency";
import { togglePublish, deleteProduct } from "@/server/actions/admin-products-list";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { images: { take: 1, orderBy: { position: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">المنتجات ({products.length})</h1>
        <Link
          href="/admin/products/import"
          className="rounded-full bg-oman-red px-5 py-2 text-sm font-bold text-white"
        >
          + استيراد منتج
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-card border border-dashed border-neutral-300 p-10 text-center text-neutral-400">
          لا توجد منتجات بعد.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-right dark:bg-neutral-900">
              <tr>
                <th className="p-3">المنتج</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">السعر</th>
                <th className="p-3">المخزون</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="flex items-center gap-2 p-3">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    )}
                    <span className="line-clamp-1">{p.name}</span>
                  </td>
                  <td className="p-3">{p.category.name}</td>
                  <td className="p-3">{formatOmr(p.sellingPrice)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <form action={togglePublish.bind(null, p.id, p.isPublished)}>
                      <button
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.isPublished
                            ? "bg-oman-green/10 text-oman-green"
                            : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800"
                        }`}
                      >
                        {p.isPublished ? "منشور" : "مخفي"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.supplierUrl && (
                        <a
                          href={p.supplierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-neutral-500 underline"
                        >
                          فتح رابط المورد
                        </a>
                      )}
                      <form action={deleteProduct.bind(null, p.id)}>
                        <button className="text-xs text-oman-red">حذف</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
