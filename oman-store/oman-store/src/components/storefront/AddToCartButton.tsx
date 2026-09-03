"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/server/actions/cart";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const result = await addToCart(productId, 1);

      if ("error" in result) {
        setMessage(
          result.error ?? "حدث خطأ أثناء إضافة المنتج إلى السلة"
        );
      } else {
        setMessage("تمت الإضافة إلى السلة");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPending}
        className="w-full rounded-full bg-oman-red px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "جارٍ الإضافة..." : "أضف إلى السلة"}
      </button>

      {message && (
        <p className="mt-2 text-sm text-neutral-500">
          {message}
        </p>
      )}
    </div>
  );
}
