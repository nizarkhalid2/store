import { Header } from "@/components/storefront/Header";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getPublishedProducts } from "@/server/actions/products";

// Forces runtime rendering — this page depends on the database/session
// at request time and must never be statically prerendered at build time
// (static prerendering of DB/auth-dependent pages caused build hangs on Render).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { items } = await getPublishedProducts({ pageSize: 8 });

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="pattern-oman relative overflow-hidden bg-gradient-to-l from-oman-green/10 via-white to-oman-red/10 py-16 dark:from-oman-green/10 dark:via-neutral-950 dark:to-oman-red/10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <span className="mb-4 inline-block rounded-full bg-oman-gold/10 px-4 py-1 text-sm font-medium text-oman-gold">
            توصيل داخل جميع محافظات السلطنة 🇴🇲
          </span>
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
            تسوّق أحدث المنتجات
            <br />
            <span className="text-oman-green">بأسعار تناسبك</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500">
            منتجات مختارة بعناية، دفع آمن بالريال العماني، وتوصيل سريع لباب بيتك.
          </p>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-4 text-xl font-bold">منتجات مختارة لك</h2>
        {items.length === 0 ? (
          <p className="rounded-card border border-dashed border-neutral-300 p-10 text-center text-neutral-400">
            لا توجد منتجات منشورة بعد — أضف منتجات من لوحة التحكم.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
