import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/storefront/Header";
import { getCart } from "@/server/actions/cart";
import { formatOmr } from "@/lib/currency";
import { CartLineControls } from "@/components/storefront/CartLineControls";

// Forces runtime rendering — this page depends on the database/session
// at request time and must never be statically prerendered at build time
// (static prerendering of DB/auth-dependent pages caused build hangs on Render).
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.sellingPrice) * item.quantity,
    0
  );

  return (
    <>
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">سلة التسوق</h1>

        {items.length === 0 ? (
          <p className="text-neutral-400">سلتك فارغة حاليًا.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-card border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
                  <Image
                    src={item.product.images[0]?.url ?? "/placeholder-product.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-oman-green">{formatOmr(item.product.sellingPrice)}</p>
                </div>
                <CartLineControls itemId={item.id} quantity={item.quantity} />
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <span className="text-neutral-500">المجموع الفرعي</span>
              <span className="text-lg font-bold">{formatOmr(subtotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded-full bg-oman-green py-3 text-center font-bold text-white"
            >
              إتمام الطلب
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
