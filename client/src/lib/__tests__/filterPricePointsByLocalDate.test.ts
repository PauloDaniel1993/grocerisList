import { describe, expect, it } from "vitest";
import { filterPricePointsByLocalDate } from "../filterPricePointsByLocalDate";
import type { PricePoint } from "../../types/priceHistory";

describe("filterPricePointsByLocalDate", () => {
  const pts: PricePoint[] = [
    {
      name: "Milk",
      price: 1,
      date: "2024-06-01T08:00:00.000Z",
      location: null,
    },
    {
      name: "Milk",
      price: 2,
      date: "2024-07-15T18:30:00.000Z",
      location: null,
    },
  ];

  it("returns all points when from and to are empty", () => {
    expect(filterPricePointsByLocalDate(pts, "", "")).toEqual(pts);
    expect(filterPricePointsByLocalDate(pts, "   ", "")).toEqual(pts);
  });

  it("excludes points before local start date when from is set", () => {
    const row: PricePoint[] = [
      {
        name: "X",
        price: 1,
        date: "2024-06-01T12:00:00.000Z",
        location: null,
      },
    ];
    expect(filterPricePointsByLocalDate(row, "2099-01-01", "")).toHaveLength(0);
  });

  it("excludes points after local end date when to is set", () => {
    const row: PricePoint[] = [
      {
        name: "X",
        price: 1,
        date: "2099-06-01T12:00:00.000Z",
        location: null,
      },
    ];
    expect(filterPricePointsByLocalDate(row, "", "2020-12-31")).toHaveLength(0);
  });
});
