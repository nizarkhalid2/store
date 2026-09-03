"use client";

import { useTransition } from "react";
import { updateCartItemQuantity, removeCartItem } from "@/server/actions/cart";

export function CartLineControls({ itemId, quantity }: { itemId: string; quantity: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => updateCartItemQuantity(itemId, quantity - 1))}
        className="h-8 w-8 rounded-full border border-neutral-300 dark:border-neutral-700"
      >
        −
      </button>
      <span className="w-6 text-center">{quantity}</span>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => updateCartItemQuantity(itemId, quantity + 1))}
        className="h-8 w-8 rounded-full border border-neutral-300 dark:border-neutral-700"
      >
        +
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => removeCartItem(itemId))}
        className="mr-2 text-xs text-oman-red"
      >
        حذف
      </button>
    </div>
  );
}
