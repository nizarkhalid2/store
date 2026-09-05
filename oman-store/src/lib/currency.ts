import type { Decimal } from "@prisma/client/runtime/library";

// OMR uses 3 decimal places (1 Rial = 1000 Baisa). Never round to 2.
export function formatOmr(amount: number | string | Decimal): string {
  const value = Number(amount);
  return `${value.toFixed(3)} ر.ع.`;
}
