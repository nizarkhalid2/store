import type { ProductImporter, ImportResult } from "./types";
import { fetchViaOpenGraph } from "./og-fetch";

/**
 * Temu publishes no public API for single-product import by third-party
 * sellers, so this relies solely on the legal Open Graph fallback — never
 * on bypassing Temu's anti-bot protection. Once IMPORTER_MODE=api and
 * TEMU_API_KEY are set (should an official partner API become available),
 * replace the body of fetchProduct() with a real API call.
 */
export class TemuImporter implements ProductImporter {
  source = "TEMU" as const;

  canHandle(url: string): boolean {
    return /temu\.com/i.test(url);
  }

  async fetchProduct(url: string): Promise<ImportResult> {
    if (process.env.IMPORTER_MODE === "api" && process.env.TEMU_API_KEY) {
      return { status: "MANUAL_FALLBACK", reason: "لم يتم بعد تفعيل تكامل API الرسمي لـ Temu." };
    }
    return fetchViaOpenGraph(url);
  }
}
