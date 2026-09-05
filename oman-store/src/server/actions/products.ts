"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Public, customer-facing fields only. supplierUrl / supplierPrice /
// importSource are intentionally left out — they only ever appear in admin
// queries.
//
// NOTE ON THE TYPE FIX: this project hit a recurring TypeScript build error
// where Prisma's inferred return type leaked unrelated model fields (e.g.
// CartItem) into `product.images`. Rather than depend on Prisma's generic
// inference for the exported return types (which behaved inconsistently
// across environments), the shapes below are written out by hand and the
// query results are cast to them explicitly. The hand-written interfaces
// describe exactly the fields selected in `select` below — if you add a
// field to `select`, add it here too.
export interface PublicProductImage {
  id: string;
  url: string;
  altText: string | null;
  position: number;
}

export interface PublicProductVariant {
  id: string;
  name: string;
  value: string;
  extraPrice: Prisma.Decimal;
  stock: number;
}

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  sellingPrice: Prisma.Decimal;
  originalPrice: Prisma.Decimal | null;
  discountPct: number | null;
  stock: number;
  categoryId: string;
  images: PublicProductImage[];
  variants: PublicProductVariant[];
  createdAt: Date;
}

export interface PublicProductDetail extends PublicProduct {
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    user: { fullName: string };
  }[];
}

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  sellingPrice: true,
  originalPrice: true,
  discountPct: true,
  stock: true,
  categoryId: true,
  images: { orderBy: { position: "asc" as const } },
  variants: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

export async function getPublishedProducts(params?: {
  categorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 24;

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(params?.categorySlug ? { category: { slug: params.categorySlug } } : {}),
    ...(params?.search
      ? { name: { contains: params.search, mode: "insensitive" } }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productSelect,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where }),
  ]);

  return { items: items as unknown as PublicProduct[], total, page, pageSize };
}

export async function getProductBySlug(slug: string): Promise<PublicProductDetail | null> {
  const product = await db.product.findFirst({
    where: { slug, isPublished: true },
    select: {
      ...productSelect,
      reviews: { where: { isApproved: true }, include: { user: { select: { fullName: true } } } },
    },
  });

  return product as unknown as PublicProductDetail | null;
}
