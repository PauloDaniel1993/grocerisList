export type GroceryCategory =
  | "produce"
  | "dairy"
  | "bakery"
  | "frozen"
  | "household"
  | "other";

export type GroceryItem = {
  id: string;
  name: string;
  category: GroceryCategory;
  bought: boolean;
  createdAt: string;
};

export const GROCERY_CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: "Produce",
  dairy: "Dairy",
  bakery: "Bakery",
  frozen: "Frozen",
  household: "Household",
  other: "Other",
};

export const GROCERY_CATEGORIES: GroceryCategory[] = [
  "produce",
  "dairy",
  "bakery",
  "frozen",
  "household",
  "other",
];

export function getGroceryCategoryLabel(category: GroceryCategory): string {
  return GROCERY_CATEGORY_LABELS[category];
}

export type NewGroceryItemInput = {
  name: string;
  category: GroceryCategory;
};

export type GroceryFilter = "all" | "active" | "bought";

export const GROCERY_FILTERS: GroceryFilter[] = ["all", "active", "bought"];

export const GROCERY_FILTER_LABELS: Record<GroceryFilter, string> = {
  all: "All",
  active: "Active",
  bought: "Bought",
};

export function getGroceryFilterLabel(filter: GroceryFilter): string {
  return GROCERY_FILTER_LABELS[filter];
}

export function getEmptyGroceryListMessage(filter: GroceryFilter): string {
  if (filter === "active") return "No active items.";
  if (filter === "bought") return "No bought items.";
  return "Your list is empty.";
}
