# متجر عماني (Oman Store) — Full-Stack E-commerce

هذا الملف يوثّق القرارات المعمارية، والحالة الحالية للمشروع، والخطة الكاملة لإكماله.

## ⚠️ ملاحظة صريحة حول النطاق

هذا طلب مشروع Full-Stack كامل (~40 ميزة رئيسية). بناؤه بجودة إنتاجية حقيقية —
حيث كل صفحة وAPI وschema مرتبطة فعليًا وتعمل — لا يمكن إنجازه بمصداقية في
استجابة واحدة. تم بناء **الأساس الكامل** أدناه (schema، هيكل المشروع، الإعدادات،
معمارية الاستيراد والدفع)، وسنكمل باقي الطبقات (auth → products/importer →
cart/checkout → payments → admin UI → analytics) على مراحل متتالية، بحيث تراجع
كل مرحلة قبل الانتقال للتالية بدل الحصول على كمّية كبيرة من الكود غير المُختبر دفعة واحدة.

## 1. Tech Stack (وسبب الاختيار)

| الطبقة | الاختيار |
|---|---|
| Frontend + Backend | Next.js 14 App Router + TypeScript (Server Actions) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Auth.js (NextAuth v5) — Role-based (`ADMIN` / `CUSTOMER`) |
| Payments | Thawani Pay — بوابة عمانية تدعم Visa/Mastercard وOMR مباشرة، متوافقة PCI (لا نخزن بيانات البطاقة أبدًا) |
| Storage | Cloudinary |
| i18n | next-intl (afac بداية Arabic RTL، جاهز لإضافة English) |

## 2. هيكل المشروع

```
oman-store/
├── prisma/
│   ├── schema.prisma        ← جاهز (هذه المرحلة)
│   └── seed.ts               ← المرحلة القادمة
├── src/
│   ├── app/
│   │   ├── (storefront)/     ← صفحات العميل: /, /products/[slug], /cart, /checkout ...
│   │   ├── (auth)/           ← /login, /register, /forgot-password
│   │   ├── admin/            ← لوحة تحكم منفصلة تمامًا، محمية بـ middleware
│   │   └── api/               ← webhooks (payment)، ونقاط لا تلائم Server Actions
│   ├── components/            ← عناصر UI قابلة لإعادة الاستخدام
│   ├── lib/
│   │   ├── importers/         ← ProductImporter abstraction (انظر §4)
│   │   ├── payments/          ← PaymentProvider abstraction (انظر §5)
│   │   └── auth.ts, db.ts, ...
│   └── server/                 ← server actions مقسّمة حسب النطاق (products, orders, cart...)
├── .env.example
└── package.json
```

## 3. مخطط قاعدة البيانات

مكتمل في `prisma/schema.prisma`: `User`, `Address`, `Category`, `Product`,
`ProductImage`, `ProductVariant`, `ProductImport`, `Cart`, `CartItem`,
`WishlistItem`, `Order`, `OrderItem`, `Payment`, `Review`, `Notification`,
`ShippingSetting`, `StoreSetting` — بعلاقات وindexes مناسبة. حقل `supplierUrl`
و`supplierPrice` في `Product` يظهران فقط في استعلامات الـ Admin (نُخفيهما صراحة
في أي API/serializer يستخدمه العميل).

## 4. معمارية استيراد المنتجات (الأهم في المشروع)

```ts
// src/lib/importers/types.ts
interface ImportedProductData {
  title: string;
  description: string;
  images: string[];
  originalPrice: number | null;
  currency: string | null;
  variants: { name: string; value: string }[];
}

interface ProductImporter {
  canHandle(url: string): boolean;
  fetchProduct(url: string): Promise<ImportedProductData>;
}
```

- `TemuImporter` و`AliExpressImporter` ينفذان هذا الـ interface.
- `ImporterRegistry` يختار المستورد المناسب حسب الدومين، ويستدعي `fetchProduct`.
- **حول القيود القانونية/التقنية**: لا Temu ولا AliExpress يقدّمان حاليًا API عام
  لاستيراد منتج مفرد لبائع خارجي (AliExpress لديه Affiliate/Dropshipping API
  يتطلب اتفاقية شراكة رسمية). لذلك:
  - `IMPORTER_MODE=api` يُستخدم إن توفرت مفاتيح API رسمية لديك مستقبلًا.
  - الوضع الافتراضي `manual_fallback`: عند لصق الرابط، يحاول النظام قراءة
    Open Graph metadata العامة من الصفحة (عنوان، صورة، وصف — بيانات عامة غير
    محمية عادةً) عبر طلب HTTP عادي بدون تجاوز أي حماية. إن فشل ذلك (Cloudflare
    أو تحميل JS)، يعرض النظام رسالة "الاستيراد التلقائي غير متاح لهذا الرابط"
    ويفتح نموذج إدخال يدوي مسبق التعبئة بالحقول الفارغة — **لا Fake success**.
  - كل محاولة (نجحت أو فشلت) تُسجَّل في جدول `ProductImport` للتدقيق.
- إضافة مصدر جديد مستقبلًا = إنشاء class جديد ينفذ `ProductImporter` وتسجيله
  في `ImporterRegistry`، بدون لمس بقية النظام.

## 5. معمارية الدفع

```ts
// src/lib/payments/types.ts
interface PaymentProvider {
  createCheckoutSession(order: Order): Promise<{ redirectUrl: string; sessionId: string }>;
  verifyPayment(sessionId: string): Promise<PaymentStatus>;
}
```

- `ThawaniProvider` هو التنفيذ الأول (مناسب لعُمان، Visa/Mastercard، OMR).
- `PAYMENT_MODE=mock` يسمح بتجربة كامل تدفق Checkout → Order → Confirmation
  محليًا بدون مفاتيح حقيقية (يُحاكي نجاح/فشل الدفع)، حتى تضيف مفاتيح Thawani
  الحقيقية في `.env` وتُبدّل `PAYMENT_MODE=sandbox` ثم `live`.
- لا يُخزَّن أي رقم بطاقة في قاعدة البيانات؛ فقط `providerRef` (معرّف الجلسة).

## 6. تدفقات العمل (Flows)

**استيراد منتج:** Admin Login → Products → Import Product → لصق الرابط →
اكتشاف المصدر → جلب البيانات (أو fallback يدوي) → Preview → تعديل + تحديد
Selling Price + Category → Publish → يظهر في المتجر.

**طلب شراء:** تصفح (بدون تسجيل) → Add to Cart → تسجيل/دخول عند Checkout →
عنوان عُماني (Governorate/Wilayat) → دفع Thawani → عند النجاح: إنشاء Order
(`paymentStatus=PAID`) + إشعار → Admin يفتح "Open Supplier Product" ويطلب من
المورد → يحدّث الحالة يدويًا عبر: `ORDERED_FROM_SUPPLIER → SHIPPED → OUT_FOR_DELIVERY → DELIVERED`.

## 7. الأدوار والصلاحيات

- Middleware يحمي `/admin/**` بالكامل (يتطلب `role=ADMIN`).
- كل حقول السعر/الحالة/الدور تُتحقق منها **server-side فقط**؛ لا يُعتمد على أي
  قيمة قادمة من الـ client لهذه الحقول.

## 8. الحالة الحالية — ما يعمل فعليًا الآن

✅ **موجود ومكتمل ككود حقيقي (لم يُختبر بالتشغيل الفعلي — لا إنترنت في بيئة البناء):**
- Schema كامل (17 جدول) + Seed data (Admin + Customer + منتجات تجريبية).
- Auth: تسجيل / دخول / أدوار (Admin/Customer) + middleware يحمي `/admin/**` بالكامل.
- الصفحة الرئيسية + صفحة كل المنتجات (بحث/تصنيف/تقسيم صفحات) + صفحة تفاصيل منتج.
- السلة الكاملة (إضافة/حذف/تعديل الكمية) مربوطة بقاعدة البيانات فعليًا لكل مستخدم.
- Checkout → إنشاء Order حقيقي (الأسعار تُقرأ من قاعدة البيانات وقت الشراء، ليس من الكاش) → جلسة دفع (mock أو Thawani حسب `PAYMENT_MODE`).
- **نظام استيراد المنتج بالكامل يعمل من طرف إلى طرف**: لصق رابط → اكتشاف المصدر → محاولة جلب Open Graph (قانوني، بدون كسر حماية) → Preview قابل للتعديل أو fallback يدوي → تحديد Selling Price مستقل عن سعر المورد → نشر.
- Admin Dashboard بإحصائيات حقيقية من قاعدة البيانات (لا أرقام وهمية).
- ألوان/طابع عماني في التصميم (أحمر/أخضر/ذهبي)، RTL كامل، Tajawal كخط عربي.

⏳ **غير مبني بعد (الأساس/الـ architecture جاهز لها لكن تحتاج شاشات فعلية):**
- My Account (Profile/Orders/Addresses/Wishlist) — الجداول جاهزة في Prisma، الصفحات لا.
- Admin: شاشات تعديل/حذف المنتج، إدارة الطلبات (تغيير الحالة)، Shipping Settings، Store Settings، Analytics charts.
- Reviews UI، Notifications UI، Dark mode toggle، صفحات Policies، SEO metadata لكل منتج، Sitemap/robots.txt.
- دعم English (البنية عبر `next-intl` جاهزة، الترجمات نفسها لا).

**السبب في هذا التقسيم:** فضّلت أن أعطيك تدفقات كاملة تعمل (Browse → Cart → Checkout → Order، وImport → Publish) بدل شاشات منفصلة لكل الميزات الـ 40 بدون ترابط حقيقي بينها. أخبرني أي جزء من "غير مبني بعد" تريده تاليًا وأكمله بنفس الأسلوب.

## 9. التثبيت والتشغيل محليًا

```bash
cp .env.example .env   # ثم املأ القيم (أو اترك PAYMENT_MODE=mock للتجربة بدون Thawani حقيقي)
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

بعدها افتح `http://localhost:3000`، ودخول Admin بـ `admin@omanstore.test` / `Admin@12345` (بيانات Seed تجريبية فقط — غيّرها قبل الإطلاق الفعلي).

## 9.1 رفعه على GitHub

```bash
cd oman-store
git init
git add .
git commit -m "Initial commit: Oman Store scaffold"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

`.gitignore` جاهز مسبقًا فيستثني `node_modules/` و`.env` و`.next/` — لا داعي لأي تعديل. **تأكد أنك لا ترفع `.env` نفسه أبدًا، فقط `.env.example`.**

## 10. ما يحتاج منك فعليًا لتشغيل Production

- `DATABASE_URL` لقاعدة PostgreSQL حقيقية (مثلاً Supabase/Railway).
- حساب Thawani Pay + مفاتيح API (يبدأ Sandbox، ثم Live بعد موافقتهم).
- حساب Cloudinary لتخزين الصور.
- قرار بشأن Temu/AliExpress: إما قبول وضع `manual_fallback` (يعمل دائمًا لكن
  يتطلب مراجعة الـ Admin)، أو الحصول على شراكة/API رسمي إن رغبت بأتمتة أعلى.

---
**التالي:** أخبرني بأي مرحلة تريد أن أبدأ بها — أقترح المرحلة 1 (Auth) لأنها
أساس كل ما بعدها.
