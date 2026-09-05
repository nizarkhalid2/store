import type { ProductImporter } from "./types";
import { TemuImporter } from "./temu-importer";
import { AliExpressImporter } from "./aliexpress-importer";

// Add a new source by creating a class + registering it here — nothing
// else in the app needs to change.
const importers: ProductImporter[] = [new TemuImporter(), new AliExpressImporter()];

export function resolveImporter(url: string): ProductImporter | null {
  return importers.find((imp) => imp.canHandle(url)) ?? null;
}
