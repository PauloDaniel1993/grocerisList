import type { BoughtItem } from "@/types/boughtList";

/** CSV matching `parseCSV` in `importFile.ts`: columns name, price, category. */
export const BOUGHT_LIST_IMPORT_TEMPLATE_CSV =
  "name,price,category\nExample item,1.99,dairy\n";

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Serializes bought items for export / round-trip import. */
export function boughtItemsToCsv(items: BoughtItem[]): string {
  const header = "name,price,category";
  const lines = items.map((item) => {
    const price =
      item.price === null || item.price === undefined ? "" : String(item.price);
    return [
      escapeCsvField(item.name),
      price,
      escapeCsvField(item.category),
    ].join(",");
  });
  return [header, ...lines].join("\n") + "\n";
}

export function triggerTextFileDownload(
  filename: string,
  content: string,
  mimeType = "text/csv;charset=utf-8"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function sanitizeFilenameBase(name: string): string {
  let s = name.trim().replace(/[\\/:*?"<>|]+/g, "-");
  s = s.replace(/-\s*-\s*/g, "-");
  s = s.replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return s || "bought-list";
}
