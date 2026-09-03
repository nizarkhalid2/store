export interface ImportedVariant {
  name: string;
  value: string;
}

export interface ImportedProductData {
  title: string;
  description: string;
  images: string[];
  originalPrice: number | null;
  currency: string | null;
  variants: ImportedVariant[];
}

export type ImportResult =
  | { status: "SUCCESS"; data: ImportedProductData }
  | { status: "MANUAL_FALLBACK"; reason: string }
  | { status: "FAILED"; reason: string };

export interface ProductImporter {
  source: "TEMU" | "ALIEXPRESS";
  canHandle(url: string): boolean;
  fetchProduct(url: string): Promise<ImportResult>;
}
