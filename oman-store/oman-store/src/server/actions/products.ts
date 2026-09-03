"use server";

import { db } from "@/lib/db";

const PUBLIC_PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  sellingPrice: true,
  originalPrice: true,
  discountPct: true,
  stock: true,
  categoryId: true,

  images: {
    select: {
      id: true,
      url: true,
      altText: true,
      position: true,
    },
    orderBy: {
      position: "asc" as const,
    },
  },

  variants: {
    select: {
      id: true,
      productId: true,
      name: true,
      value: true,
      extraPrice: true,
      stock: true,
    },
  },

  createdAt: true,
} satisfies Parameters<typeof db.product.findMany>[0]["select"];

export async function getPublishedProducts(params?: {
  categorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 24;

  const where = {
    isPublished: true,
    ...(params?.categorySlug
      ? {
          category: {
            slug: params.categorySlug,
          },
        }
      : {}),
    ...(params?.search
      ? {
          name: {
            contains: params.search,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      select: PUBLIC_PRODUCT_SELECT,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    }),

    db.product.count({
      where,
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: {
      slug,
      isPublished: true,
    },

    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sellingPrice: true,
      originalPrice: true,
      discountPct: true,
      stock: true,
      categoryId: true,

      images: {
        select: {
          id: true,
          url: true,
          altText: true,
          position: true,
        },
        orderBy: {
          position: "asc",
        },
      },

      variants: {
        select: {
          id: true,
          productId: true,
          name: true,
          value: true,
          extraPrice: true,
          stock: true,
        },
      },

      createdAt: true,

      reviews: {
        where: {
          isApproved: true,
        },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });
}
