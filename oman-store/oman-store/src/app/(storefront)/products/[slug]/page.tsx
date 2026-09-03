import { notFound } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/storefront/Header";
import { getProductBySlug } from "@/server/actions/products";
import { formatOmr } from "@/lib/currency";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const cover = product.images[0]?.url ?? "/placeholder-product.png";

  return (
    <>
      <Header />
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-card bg-neutral-100 dark:bg-neutral-900">
            <Image src={cover} alt={product.name} fill className="object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-oman-green">
              {formatOmr(product.sellingPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-neutral-400 line-through">
                {formatOmr(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {product.description}
          </p>

          <p className="mt-3 text-sm">
            {product.stock > 0 ? (
              <span className="text-oman-green">متوفر ({product.stock} قطعة)</span>
            ) : (
              <span className="text-oman-red">غير متوفر حاليًا</span>
            )}
          </p>

          <div className="mt-6">
            <AddToCartButton productId={product.id} disabled={product.stock === 0} />
          </div>
        </div>
      </section>
    </>
  );
}
