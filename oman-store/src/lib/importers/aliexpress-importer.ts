import type { ProductImporter, ImportResult } from "./types";
import { fetchViaOpenGraph } from "./og-fetch";

/**
 * AliExpress has an official Affiliate/Dropshipping API, but it requires a
 * partner agreement and credentials this project can't assume you have.
 * Until ALIEXPRESS_API_KEY is configured, this uses the same legal Open
 * Graph fallback as Temu.
 */
export class AliExpressImporter implements ProductImporter {
  source = "ALIEXPRESS" as const;

  canHandle(url: string): boolean {
    return /aliexpress\.com/i.test(url);
  }

  async fetchProduct(url: string): Promise<ImportResult> {
    if (process.env.IMPORTER_MODE === "api" && process.env.ALIEXPRESS_API_KEY) {
      return { status: "MANUAL_FALLBACK", reason: "لم يتم بعد تفعيل تكامل API الرسمي لـ AliExpress." };
    }
    return fetchViaOpenGraph(url);
  }
}
