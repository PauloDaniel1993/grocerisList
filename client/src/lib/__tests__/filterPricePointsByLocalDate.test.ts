import { describe, expect, it } from "vitest";
import {
  filterPricePointsByLocalDate,
  validateDateRange,
} from "../filterPricePointsByLocalDate";
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

describe("validateDateRange", () => {
  it("returns null when both fields are empty", () => {
    expect(validateDateRange("", "")).toBeNull();
    expect(validateDateRange("   ", "")).toBeNull();
  });

  it("returns null when only from is filled with a valid date", () => {
    expect(validateDateRange("2024-06-01", "")).toBeNull();
    expect(validateDateRange("2024-06-01", "   ")).toBeNull();
  });

  it("returns null when only to is filled with a valid date", () => {
    expect(validateDateRange("", "2024-06-01")).toBeNull();
    expect(validateDateRange("   ", "2024-06-01")).toBeNull();
  });

  it("returns error for invalid from date", () => {
    expect(validateDateRange("not-a-date", "")).toBe("Invalid From date");
    expect(validateDateRange("2024-13-01", "")).toBe("Invalid From date");
    expect(validateDateRange("2024-02-30", "")).toBe("Invalid From date");
  });

  it("returns error for invalid to date", () => {
    expect(validateDateRange("", "not-a-date")).toBe("Invalid To date");
    expect(validateDateRange("", "2024-13-01")).toBe("Invalid To date");
    expect(validateDateRange("", "2024-02-30")).toBe("Invalid To date");
  });

  it("returns error when to is before from", () => {
    expect(validateDateRange("2024-06-15", "2024-06-01")).toBe(
      "To date must be on or after From date"
    );
    expect(validateDateRange("2025-01-01", "2024-12-31")).toBe(
      "To date must be on or after From date"
    );
  });

  it("returns null when to equals from", () => {
    expect(validateDateRange("2024-06-01", "2024-06-01")).toBeNull();
  });

  it("returns null when to is after from", () => {
    expect(validateDateRange("2024-06-01", "2024-06-15")).toBeNull();
    expect(validateDateRange("2024-12-31", "2025-01-01")).toBeNull();
  });
});
