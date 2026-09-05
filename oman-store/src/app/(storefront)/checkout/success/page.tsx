import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { confirmPayment } from "@/server/actions/orders";

// Forces runtime rendering — confirms payment against the database at
// request time and must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderNumber = searchParams.order;

  if (!orderNumber) {
    return (
      <>
        <Header />
        <section className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-oman-red">رقم الطلب غير موجود.</p>
        </section>
      </>
    );
  }

  const result = await confirmPayment(orderNumber);
  const isPaid = "status" in result && result.status === "PAID";

  return (
    <>
      <Header />
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        {isPaid ? (
          <>
            <div className="mb-4 text-5xl">✅</div>
            <h1 className="mb-2 text-xl font-bold text-oman-green">تم الدفع بنجاح</h1>
            <p className="text-neutral-500">رقم طلبك: {orderNumber}</p>
            <p className="mt-2 text-sm text-neutral-400">
              سنقوم بمعالجة طلبك وتحديثك بحالته أولاً بأول.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 text-5xl">⚠️</div>
            <h1 className="mb-2 text-xl font-bold text-oman-red">حدثت مشكلة أثناء الدفع</h1>
            <p className="text-neutral-500">لم نتمكن من تأكيد الدفع لطلبك رقم {orderNumber}.</p>
          </>
        )}

        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-oman-green px-6 py-3 font-bold text-white"
        >
          العودة للمتجر
        </Link>
      </section>
    </>
  );
}
