import { describe, expect, it } from "vitest";
import type { GroceryItem } from "../../types/grocery";
import { filterGroceries } from "../filterGroceries";

const a: GroceryItem = {
  id: "1",
  name: "A",
  category: "other",
  bought: false,
  createdAt: "",
};
const b: GroceryItem = {
  id: "2",
  name: "B",
  category: "other",
  bought: true,
  createdAt: "",
};

describe("filterGroceries", () => {
  it("returns all items for all", () => {
    expect(filterGroceries([a, b], "all")).toEqual([a, b]);
  });

  it("returns only not bought for active", () => {
    expect(filterGroceries([a, b], "active")).toEqual([a]);
  });

  it("returns only bought for bought", () => {
    expect(filterGroceries([a, b], "bought")).toEqual([b]);
  });

  it("returns empty for empty input", () => {
    expect(filterGroceries([], "all")).toEqual([]);
    expect(filterGroceries([], "active")).toEqual([]);
    expect(filterGroceries([], "bought")).toEqual([]);
  });
});
