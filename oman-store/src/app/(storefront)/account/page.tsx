import { redirect } from "next/navigation";
import { Header } from "@/components/storefront/Header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOmr } from "@/lib/currency";
import { deleteAddress, createAddress } from "@/server/actions/addresses";
import { signOutAction } from "@/server/actions/auth";

// Forces runtime rendering — this page depends on the logged-in user's
// session/data and must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

const GOVERNORATES = [
  "مسقط", "ظفار", "مسندم", "البريمي", "الداخلية",
  "شمال الباطنة", "جنوب الباطنة", "الظاهرة", "شمال الشرقية", "جنوب الشرقية", "الوسطى",
];

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const userId = (session.user as any).id as string;

  const [addresses, orders] = await Promise.all([
    db.address.findMany({ where: { userId } }),
    db.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <>
      <Header />
      <section className="mx-auto max-w-2xl space-y-10 px-4 py-8">
        <div>
          <h1 className="mb-1 text-xl font-bold">حسابي</h1>
          <p className="text-sm text-neutral-500">{session.user.name} — {session.user.email}</p>
          <form action={signOutAction}>
            <button className="mt-2 text-sm text-oman-red">تسجيل الخروج</button>
          </form>
        </div>

        {/* Orders */}
        <div>
          <h2 className="mb-3 font-bold">طلباتي</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-neutral-400">لا توجد طلبات بعد.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-card border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                >
                  <span>{o.orderNumber}</span>
                  <span className="text-neutral-500">{o.status}</span>
                  <span className="font-bold text-oman-green">{formatOmr(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Addresses */}
        <div>
          <h2 className="mb-3 font-bold">عناويني</h2>
          <div className="mb-4 space-y-2">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-card border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <span>{a.fullName} — {a.wilayat}، {a.governorate} — {a.phone}</span>
                <form action={deleteAddress.bind(null, a.id)}>
                  <button className="text-xs text-oman-red">حذف</button>
                </form>
              </div>
            ))}
            {addresses.length === 0 && (
              <p className="text-sm text-neutral-400">لا يوجد عنوان محفوظ بعد — أضف واحدًا بالأسفل.</p>
            )}
          </div>

          <form action={createAddress} className="space-y-3 rounded-card border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="text-sm font-medium">إضافة عنوان جديد</p>
            <input
              name="fullName"
              required
              placeholder="الاسم الكامل"
              className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
            <input
              name="phone"
              required
              placeholder="رقم الهاتف"
              className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
            <select
              name="governorate"
              required
              className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <input
              name="wilayat"
              required
              placeholder="الولاية"
              className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
            <input
              name="additionalDetails"
              placeholder="تفاصيل إضافية (اختياري)"
              className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button className="rounded-full bg-oman-green px-6 py-2 text-sm font-bold text-white">
              حفظ العنوان
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
