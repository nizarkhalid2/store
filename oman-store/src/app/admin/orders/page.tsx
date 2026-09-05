import { db } from "@/lib/db";
import { formatOmr } from "@/lib/currency";
import { updateOrderStatus } from "@/server/actions/admin-orders";

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "PAID", label: "مدفوع" },
  { value: "PROCESSING", label: "قيد المعالجة" },
  { value: "ORDERED_FROM_SUPPLIER", label: "تم الطلب من المورد" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "OUT_FOR_DELIVERY", label: "قيد التوصيل" },
  { value: "DELIVERED", label: "تم التوصيل" },
  { value: "CANCELLED", label: "ملغي" },
  { value: "REFUNDED", label: "مسترجع" },
];

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, address: true, items: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">الطلبات ({orders.length})</h1>

      {orders.length === 0 ? (
        <p className="rounded-card border border-dashed border-neutral-300 p-10 text-center text-neutral-400">
          لا توجد طلبات بعد.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-card border border-neutral-200 p-4 text-sm dark:border-neutral-800">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{o.orderNumber}</p>
                  <p className="text-neutral-500">{o.user.fullName} — {o.address.wilayat}، {o.address.governorate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-oman-green">{formatOmr(o.total)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      o.paymentStatus === "PAID"
                        ? "bg-oman-green/10 text-oman-green"
                        : "bg-oman-red/10 text-oman-red"
                    }`}
                  >
                    {o.paymentStatus === "PAID" ? "مدفوع" : "غير مدفوع"}
                  </span>
                </div>
              </div>

              <p className="mb-2 text-xs text-neutral-400">
                {o.items.length} منتج — {o.items.map((i) => i.productName).join("، ")}
              </p>

              <form action={updateOrderStatus} className="flex items-center gap-2">
                <input type="hidden" name="orderId" value={o.id} />
                <select
                  name="status"
                  defaultValue={o.status}
                  className="rounded-lg border border-neutral-300 p-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button className="rounded-full bg-oman-red px-4 py-1.5 text-xs font-bold text-white">
                  تحديث الحالة
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
