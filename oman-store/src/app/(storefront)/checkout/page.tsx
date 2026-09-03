import { Header } from "@/components/storefront/Header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { createOrderAndCheckout } from "@/server/actions/orders";

// Forces runtime rendering — this page depends on the database/session
// at request time and must never be statically prerendered at build time
// (static prerendering of DB/auth-dependent pages caused build hangs on Render).
export const dynamic = "force-dynamic";

const GOVERNORATES = [
  "مسقط",
  "ظفار",
  "مسندم",
  "البريمي",
  "الداخلية",
  "شمال الباطنة",
  "جنوب الباطنة",
  "الظاهرة",
  "شمال الشرقية",
  "جنوب الشرقية",
  "الوسطى",
];

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  const addresses = await db.address.findMany({
    where: { userId: (session.user as any).id },
  });

  return (
    <>
      <Header />
      <section className="mx-auto max-w-xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">إتمام الطلب</h1>

        <form action={createOrderAndCheckout} className="space-y-4">
          {addresses.length > 0 ? (
            <div>
              <label className="mb-1 block text-sm font-medium">اختر عنوانًا محفوظًا</label>
              <select name="addressId" className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900">
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.wilayat} — {a.governorate} — {a.phone}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="rounded-lg bg-oman-gold/10 p-3 text-sm">
              لا يوجد لديك عنوان محفوظ بعد — أضف عنوانًا من صفحة حسابك أولًا.
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">المحافظة (لحساب الشحن)</label>
            <select name="governorate" className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900">
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={addresses.length === 0}
            className="w-full rounded-full bg-oman-red py-3 font-bold text-white disabled:opacity-50"
          >
            المتابعة إلى الدفع
          </button>
        </form>
      </section>
    </>
  );
}
