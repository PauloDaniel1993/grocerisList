import type { GroceryFilter, GroceryItem } from "../types/grocery";

export function filterGroceries(
  items: GroceryItem[],
  filter: GroceryFilter
): GroceryItem[] {
  if (filter === "active") return items.filter((i) => !i.bought);
  if (filter === "bought") return items.filter((i) => i.bought);
  return items;
}
