import Image from "next/image";
import Link from "next/link";
import { formatOmr } from "@/lib/currency";
import type { PublicProduct } from "@/server/actions/products";

type Props = {
  product: PublicProduct;
};

export function ProductCard({ product }: Props) {
  const cover = product.images[0]?.url ?? "/placeholder-product.png";
  const hasDiscount = product.discountPct && product.discountPct > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-card border border-neutral-200 transition hover:shadow-lg dark:border-neutral-800"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <Image
          src={cover}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded-full bg-oman-red px-2 py-0.5 text-xs font-bold text-white">
            خصم {product.discountPct}%
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-bold text-oman-green">{formatOmr(product.sellingPrice)}</span>
          {hasDiscount && product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">
              {formatOmr(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
