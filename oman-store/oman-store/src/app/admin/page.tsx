import { db } from "@/lib/db";
import { formatOmr } from "@/lib/currency";

export default async function AdminDashboardPage() {
  const [totalOrders, totalCustomers, totalProducts, pendingOrders, revenueAgg, recentOrders] =
    await Promise.all([
      db.order.count(),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.product.count(),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      db.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true } }),
    ]);

  const stats = [
    { label: "إجمالي الإيرادات", value: formatOmr(revenueAgg._sum.total ?? 0) },
    { label: "إجمالي الطلبات", value: totalOrders },
    { label: "العملاء", value: totalCustomers },
    { label: "المنتجات", value: totalProducts },
    { label: "طلبات معلّقة", value: pendingOrders },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">نظرة عامة</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="mt-1 text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-bold">أحدث الطلبات</h2>
      <div className="overflow-x-auto rounded-card border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-right dark:bg-neutral-900">
            <tr>
              <th className="p-3">رقم الطلب</th>
              <th className="p-3">العميل</th>
              <th className="p-3">الإجمالي</th>
              <th className="p-3">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="p-3">{o.orderNumber}</td>
                <td className="p-3">{o.user.fullName}</td>
                <td className="p-3">{formatOmr(o.total)}</td>
                <td className="p-3">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
