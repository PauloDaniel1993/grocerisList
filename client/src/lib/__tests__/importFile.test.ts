import { describe, expect, it } from "vitest";
import {
  matchEntries,
  parseCSV,
  parseImportFile,
  parseJSON,
} from "../importFile";
import type { BoughtItem } from "../../types/boughtList";

const makeItem = (overrides: Partial<BoughtItem> & { id: string; name: string }): BoughtItem => ({
  boughtListId: "bl-1",
  category: "other",
  price: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

describe("parseCSV", () => {
  it("parses basic CSV with name, price, category", () => {
    const csv = "name,price,category\ntomato,1.5,produce\nmilk,2.0,dairy\n";
    const entries = parseCSV(csv);
    expect(entries).toEqual([
      { name: "tomato", price: 1.5, category: "produce" },
      { name: "milk", price: 2, category: "dairy" },
    ]);
  });

  it("handles semicolons as delimiters", () => {
    const csv = "name;price;category\nbread;0.99;bakery\n";
    const entries = parseCSV(csv);
    expect(entries).toEqual([
      { name: "bread", price: 0.99, category: "bakery" },
    ]);
  });

  it("handles display labels for category", () => {
    const csv = "name,category\napples,Produce\n";
    const entries = parseCSV(csv);
    expect(entries[0]!.category).toBe("produce");
  });

  it("skips rows with empty names", () => {
    const csv = "name,price\n,1.0\ntomato,2.0\n";
    const entries = parseCSV(csv);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.name).toBe("tomato");
  });

  it("sets null for missing price/category columns", () => {
    const csv = "name\ntomato\n";
    const entries = parseCSV(csv);
    expect(entries).toEqual([{ name: "tomato", price: null, category: null }]);
  });

  it("throws when name column is missing", () => {
    const csv = "price,category\n1.5,produce\n";
    expect(() => parseCSV(csv)).toThrow('CSV must have a "name" column');
  });

  it("handles quoted fields with commas", () => {
    const csv = 'name,price\n"milk, whole",3.5\n';
    const entries = parseCSV(csv);
    expect(entries[0]!.name).toBe("milk, whole");
  });

  it("returns empty for a header-only file", () => {
    expect(parseCSV("name,price")).toEqual([]);
  });
});

describe("parseJSON", () => {
  it("parses an array of objects", () => {
    const json = JSON.stringify([
      { name: "tomato", price: 1.5, category: "produce" },
      { name: "milk", price: 2, category: "dairy" },
    ]);
    const entries = parseJSON(json);
    expect(entries).toEqual([
      { name: "tomato", price: 1.5, category: "produce" },
      { name: "milk", price: 2, category: "dairy" },
    ]);
  });

  it("skips entries with missing/empty names", () => {
    const json = JSON.stringify([
      { name: "", price: 1 },
      { price: 2 },
      { name: "bread", price: 0.5 },
    ]);
    const entries = parseJSON(json);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.name).toBe("bread");
  });

  it("throws for non-array input", () => {
    expect(() => parseJSON('{"name":"tomato"}')).toThrow(
      "JSON must be an array"
    );
  });
});

describe("parseImportFile", () => {
  it("delegates to JSON for .json files", () => {
    const data = JSON.stringify([{ name: "test", price: 1 }]);
    const entries = parseImportFile(data, "data.json");
    expect(entries).toHaveLength(1);
  });

  it("delegates to CSV for .csv files", () => {
    const entries = parseImportFile("name,price\ntomato,1", "data.csv");
    expect(entries).toHaveLength(1);
  });
});

describe("matchEntries", () => {
  const items: BoughtItem[] = [
    makeItem({ id: "1", name: "Tomato" }),
    makeItem({ id: "2", name: "Milk" }),
    makeItem({ id: "3", name: "Bread" }),
  ];

  it("matches entries by case-insensitive name", () => {
    const fileEntries = [
      { name: "tomato", price: 1.5, category: "produce" as const },
      { name: "MILK", price: 2, category: "dairy" as const },
    ];
    const result = matchEntries(fileEntries, items);
    expect(result.matched).toHaveLength(2);
    expect(result.matched[0]!.item.id).toBe("1");
    expect(result.matched[1]!.item.id).toBe("2");
    expect(result.unmatched).toHaveLength(0);
  });

  it("puts non-matching entries in unmatched", () => {
    const fileEntries = [
      { name: "tomato", price: 1.5, category: null },
      { name: "unknown item", price: 3, category: null },
    ];
    const result = matchEntries(fileEntries, items);
    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toHaveLength(1);
    expect(result.unmatched[0]!.name).toBe("unknown item");
  });

  it("does not match the same bought item twice", () => {
    const fileEntries = [
      { name: "tomato", price: 1, category: null },
      { name: "tomato", price: 2, category: null },
    ];
    const result = matchEntries(fileEntries, items);
    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toHaveLength(1);
  });
});
