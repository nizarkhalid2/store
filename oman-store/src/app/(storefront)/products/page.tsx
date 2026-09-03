import { Header } from "@/components/storefront/Header";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getPublishedProducts } from "@/server/actions/products";

// Forces runtime rendering — this page depends on the database/session
// at request time and must never be statically prerendered at build time
// (static prerendering of DB/auth-dependent pages caused build hangs on Render).
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; page?: string };
}) {
  const { items, total, page, pageSize } = await getPublishedProducts({
    search: searchParams.q,
    categorySlug: searchParams.category,
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">
          {searchParams.q ? `نتائج البحث عن "${searchParams.q}"` : "كل المنتجات"}
        </h1>

        {items.length === 0 ? (
          <p className="text-neutral-400">لا توجد نتائج مطابقة.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2 text-sm">
            صفحة {page} من {totalPages}
          </div>
        )}
      </section>
    </>
  );
}
