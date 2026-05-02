import { describe, expect, it } from "vitest";
import { boughtItemsToCsv, sanitizeFilenameBase } from "../boughtListCsv";
import { parseCSV } from "../importFile";
import type { BoughtItem } from "../../types/boughtList";

describe("boughtItemsToCsv", () => {
  it("writes header and rows with empty price when null", () => {
    const items: BoughtItem[] = [
      {
        id: "1",
        boughtListId: "b",
        name: "Milk",
        category: "dairy",
        price: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    expect(boughtItemsToCsv(items)).toBe("name,price,category\nMilk,,dairy\n");
  });

  it("escapes commas and quotes in names", () => {
    const items: BoughtItem[] = [
      {
        id: "1",
        boughtListId: "b",
        name: 'Bread, whole "grain"',
        category: "bakery",
        price: 2.5,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    expect(boughtItemsToCsv(items)).toBe(
      'name,price,category\n"Bread, whole ""grain""",2.5,bakery\n'
    );
  });

  it("round-trips through parseCSV", () => {
    const items: BoughtItem[] = [
      {
        id: "1",
        boughtListId: "b",
        name: "Eggs",
        category: "dairy",
        price: 4,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    const parsed = parseCSV(boughtItemsToCsv(items));
    expect(parsed).toEqual([
      { name: "Eggs", price: 4, category: "dairy" },
    ]);
  });
});

describe("sanitizeFilenameBase", () => {
  it("removes unsafe characters", () => {
    expect(sanitizeFilenameBase('Trip / Store: "A"')).toBe("Trip - Store-A");
  });
});
