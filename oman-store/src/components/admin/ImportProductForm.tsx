"use client";

import { useState, useTransition } from "react";
import { importProductFromUrl, publishProduct } from "@/server/actions/admin-products";

type Category = { id: string; name: string };

type PreviewState =
  | { kind: "idle" }
  | { kind: "manual"; message: string; source: string }
  | {
      kind: "preview";
      source: string;
      title: string;
      description: string;
      images: string[];
    };

export function ImportProductForm({ categories }: { categories: Category[] }) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<PreviewState>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  function handleImport() {
    startTransition(async () => {
      const result = await importProductFromUrl(url);
      if (result.status === "SUCCESS") {
        setState({
          kind: "preview",
          source: result.source,
          title: result.data.title,
          description: result.data.description,
          images: result.data.images,
        });
      } else if (result.status === "MANUAL") {
        setState({ kind: "manual", message: result.message, source: result.source });
      } else {
        setState({ kind: "manual", message: result.message, source: "MANUAL" });
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">رابط المنتج (Temu أو AliExpress)</label>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            onClick={handleImport}
            disabled={!url || isPending}
            className="rounded-lg bg-oman-green px-6 font-bold text-white disabled:opacity-50"
          >
            {isPending ? "جارٍ الجلب..." : "استيراد"}
          </button>
        </div>
      </div>

      {state.kind === "manual" && (
        <p className="rounded-lg bg-oman-gold/10 p-3 text-sm">
          {state.message} — يمكنك إدخال بيانات المنتج يدويًا أدناه.
        </p>
      )}

      {(state.kind === "preview" || state.kind === "manual") && (
        <form action={publishProduct} className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <input type="hidden" name="supplierUrl" value={url} />
          <input
            type="hidden"
            name="importSource"
            value={state.kind === "preview" ? state.source : "MANUAL"}
          />

          <input
            name="name"
            required
            defaultValue={state.kind === "preview" ? state.title : ""}
            placeholder="اسم المنتج"
            className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <textarea
            name="description"
            required
            defaultValue={state.kind === "preview" ? state.description : ""}
            placeholder="الوصف"
            rows={4}
            className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <textarea
            name="images"
            defaultValue={state.kind === "preview" ? state.images.join("\n") : ""}
            placeholder="روابط الصور (رابط في كل سطر)"
            rows={3}
            className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="supplierPrice"
              type="number"
              step="0.001"
              placeholder="سعر المورد (اختياري، للأدمن فقط)"
              className="rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <input
              name="sellingPrice"
              type="number"
              step="0.001"
              required
              placeholder="سعر البيع (ريال عماني)"
              className="rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <input
              name="originalPrice"
              type="number"
              step="0.001"
              placeholder="السعر الأصلي قبل الخصم (اختياري)"
              className="rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <input
              name="stock"
              type="number"
              defaultValue={0}
              placeholder="الكمية المتوفرة"
              className="rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <select
            name="categoryId"
            required
            className="w-full rounded-lg border border-neutral-300 p-3 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">اختر التصنيف</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button className="w-full rounded-full bg-oman-red py-3 font-bold text-white">
            نشر المنتج
          </button>
        </form>
      )}
    </div>
  );
}
