import * as cheerio from "cheerio";
import type { ImportedProductData, ImportResult } from "./types";

/**
 * Generic, legal fallback used by every importer: a plain HTTP GET of the
 * public product page (no headless browser, no CAPTCHA/Cloudflare bypass)
 * reading standard Open Graph / meta tags — the same public tags the site
 * exposes for link previews on WhatsApp, Twitter, etc.
 *
 * If the page needs JS rendering or blocks the request, this returns
 * MANUAL_FALLBACK instead of attempting to circumvent protection.
 */
export async function fetchViaOpenGraph(url: string): Promise<ImportResult> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OmanStoreBot/1.0)" },
      redirect: "follow",
    });

    if (!res.ok) {
      return {
        status: "MANUAL_FALLBACK",
        reason: `تعذر الوصول للرابط (HTTP ${res.status}). يبدو أن الموقع يحظر الطلبات الآلية.`,
      };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") || $("title").first().text() || "";
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";
    const images = $('meta[property="og:image"]')
      .map((_, el) => $(el).attr("content"))
      .get()
      .filter(Boolean) as string[];

    if (!title || images.length === 0) {
      return {
        status: "MANUAL_FALLBACK",
        reason: "الصفحة تعتمد على JavaScript لعرض بيانات المنتج، ولم نتمكن من استخراجها تلقائيًا.",
      };
    }

    const data: ImportedProductData = {
      title,
      description,
      images,
      originalPrice: null,
      currency: null,
      variants: [],
    };

    return { status: "SUCCESS", data };
  } catch {
    return { status: "FAILED", reason: "حدث خطأ أثناء محاولة الاتصال بالرابط." };
  }
}
