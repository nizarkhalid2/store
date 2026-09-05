import { db } from "@/lib/db";
import { updateStoreSettings, upsertShippingFee } from "@/server/actions/admin-settings";

export const dynamic = "force-dynamic";

const GOVERNORATES = [
  "مسقط", "ظفار", "مسندم", "البريمي", "الداخلية",
  "شمال الباطنة", "جنوب الباطنة", "الظاهرة", "شمال الشرقية", "جنوب الشرقية", "الوسطى",
];

export default async function AdminSettingsPage() {
  const [settings, shippingSettings] = await Promise.all([
    db.storeSetting.findUnique({ where: { id: "singleton" } }),
    db.shippingSetting.findMany(),
  ]);

  const feeByGovernorate = new Map(shippingSettings.map((s) => [s.governorate, s.fee]));

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="mb-4 text-xl font-bold">إعدادات المتجر</h1>
        <form action={updateStoreSettings} className="space-y-3 rounded-card border border-neutral-200 p-4 dark:border-neutral-800">
          <input
            name="storeName"
            defaultValue={settings?.storeName ?? "متجرنا"}
            placeholder="اسم المتجر"
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <textarea
            name="storeDescription"
            defaultValue={settings?.storeDescription ?? ""}
            placeholder="وصف المتجر"
            rows={2}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input
            name="contactPhone"
            defaultValue={settings?.contactPhone ?? ""}
            placeholder="رقم التواصل"
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input
            name="contactEmail"
            defaultValue={settings?.contactEmail ?? ""}
            placeholder="البريد الإلكتروني"
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button className="rounded-full bg-oman-green px-6 py-2 text-sm font-bold text-white">حفظ</button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 font-bold">أسعار الشحن حسب المحافظة</h2>
        <div className="space-y-2">
          {GOVERNORATES.map((g) => (
            <form
              key={g}
              action={upsertShippingFee}
              className="flex items-center gap-3 rounded-card border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <input type="hidden" name="governorate" value={g} />
              <span className="w-32">{g}</span>
              <input
                name="fee"
                type="number"
                step="0.001"
                defaultValue={feeByGovernorate.get(g)?.toString() ?? ""}
                placeholder="السعر (OMR)"
                className="w-32 rounded-lg border border-neutral-300 p-1.5 dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button className="rounded-full bg-oman-gold/20 px-4 py-1.5 text-xs font-bold text-oman-ink dark:text-white">
                حفظ
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
