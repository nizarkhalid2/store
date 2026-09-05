import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data (clearly marked as TEST data)...");

  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const admin = await db.user.upsert({
    where: { email: "admin@omanstore.test" },
    update: {},
    create: {
      fullName: "مدير المتجر (تجريبي)",
      email: "admin@omanstore.test",
      phone: "90000000",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const customerPassword = await bcrypt.hash("Customer@12345", 10);
  const customer = await db.user.upsert({
    where: { email: "customer@omanstore.test" },
    update: {},
    create: {
      fullName: "عميل تجريبي",
      email: "customer@omanstore.test",
      phone: "91111111",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  const categoryNames = ["إلكترونيات", "المنزل", "الجمال", "إكسسوارات", "ألعاب"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      db.category.upsert({
        where: { slug: name },
        update: {},
        create: { name, slug: name },
      })
    )
  );

  const shippingDefaults = [
    { governorate: "مسقط", fee: 1.0 },
    { governorate: "ظفار", fee: 2.5 },
    { governorate: "الداخلية", fee: 2.0 },
  ];
  for (const s of shippingDefaults) {
    await db.shippingSetting.upsert({
      where: { governorate: s.governorate },
      update: {},
      create: s,
    });
  }

  await db.storeSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "متجرنا 🇴🇲",
      storeDescription: "متجر إلكتروني عماني حديث",
      currency: "OMR",
    },
  });

  const demoProducts = [
    { name: "سماعة بلوتوث لاسلكية (تجريبي)", price: 5.5, original: 8.0, stock: 20 },
    { name: "ساعة ذكية رياضية (تجريبي)", price: 12.9, original: 18.0, stock: 15 },
    { name: "شاحن سريع USB-C (تجريبي)", price: 2.5, original: null, stock: 50 },
    { name: "حقيبة ظهر عصرية (تجريبي)", price: 7.0, original: 9.5, stock: 10 },
  ];

  for (const [i, p] of demoProducts.entries()) {
    const slug = `${p.name.replace(/\s+/g, "-")}-${i}`;
    await db.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: "منتج تجريبي (Seed Data) لأغراض العرض فقط — استبدله ببيانات حقيقية.",
        sku: `DEMO-SKU-${i + 1}`,
        sellingPrice: p.price,
        originalPrice: p.original,
        discountPct: p.original ? Math.round(((p.original - p.price) / p.original) * 100) : null,
        stock: p.stock,
        isPublished: true,
        categoryId: categories[i % categories.length].id,
        importSource: "MANUAL",
        images: {
          create: [{ url: "/placeholder-product.png", position: 0 }],
        },
      },
    });
  }

  console.log("✅ Done. Admin login: admin@omanstore.test / Admin@12345");
  console.log("✅ Customer login: customer@omanstore.test / Customer@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
