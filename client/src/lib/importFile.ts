import {
  GROCERY_CATEGORIES,
  GROCERY_CATEGORY_LABELS,
  type GroceryCategory,
} from "../types/grocery";
import type { BoughtItem } from "../types/boughtList";

export type FileEntry = {
  name: string;
  price: number | null;
  category: GroceryCategory | null;
};

export type MatchResult = {
  matched: Array<{ fileEntry: FileEntry; item: BoughtItem }>;
  unmatched: FileEntry[];
};

function normalizeCategory(raw: string): GroceryCategory | null {
  const lower = raw.trim().toLowerCase();
  if ((GROCERY_CATEGORIES as readonly string[]).includes(lower)) {
    return lower as GroceryCategory;
  }
  for (const [key, label] of Object.entries(GROCERY_CATEGORY_LABELS)) {
    if (label.toLowerCase() === lower) return key as GroceryCategory;
  }
  return null;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === "," || ch === ";") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

export function parseCSV(text: string): FileEntry[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0]!;
  const headers = parseCSVLine(headerLine).map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  const priceIdx = headers.indexOf("price");
  const categoryIdx = headers.indexOf("category");

  if (nameIdx === -1) throw new Error('CSV must have a "name" column');

  const entries: FileEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]!);
    const name = (fields[nameIdx] ?? "").trim();
    if (!name) continue;

    const rawPrice = priceIdx >= 0 ? (fields[priceIdx] ?? "").trim() : "";
    const parsed = rawPrice ? Number(rawPrice) : null;

    const rawCategory = categoryIdx >= 0 ? (fields[categoryIdx] ?? "").trim() : "";
    const category = rawCategory ? normalizeCategory(rawCategory) : null;

    entries.push({
      name,
      price: parsed !== null && Number.isFinite(parsed) ? parsed : null,
      category,
    });
  }
  return entries;
}

export function parseJSON(text: string): FileEntry[] {
  const data = JSON.parse(text) as unknown;
  if (!Array.isArray(data)) throw new Error("JSON must be an array of objects");

  return data
    .filter(
      (item: Record<string, unknown>) =>
        item && typeof item.name === "string" && item.name.trim()
    )
    .map((item: Record<string, unknown>) => ({
      name: String(item.name).trim(),
      price:
        item.price != null && Number.isFinite(Number(item.price))
          ? Number(item.price)
          : null,
      category:
        item.category != null
          ? normalizeCategory(String(item.category))
          : null,
    }));
}

export function parseImportFile(text: string, filename: string): FileEntry[] {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "json") return parseJSON(text);
  return parseCSV(text);
}

export function matchEntries(
  fileEntries: FileEntry[],
  items: BoughtItem[]
): MatchResult {
  const matched: MatchResult["matched"] = [];
  const unmatched: FileEntry[] = [];

  const itemsByName = new Map<string, BoughtItem>();
  for (const item of items) {
    itemsByName.set(item.name.trim().toLowerCase(), item);
  }

  const usedItemIds = new Set<string>();

  for (const entry of fileEntries) {
    const key = entry.name.trim().toLowerCase();
    const item = itemsByName.get(key);
    if (item && !usedItemIds.has(item.id)) {
      matched.push({ fileEntry: entry, item });
      usedItemIds.add(item.id);
    } else {
      unmatched.push(entry);
    }
  }

  return { matched, unmatched };
}
