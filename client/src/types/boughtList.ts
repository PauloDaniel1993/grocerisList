import type { GroceryCategory } from "./grocery";

export type BoughtItem = {
  id: string;
  boughtListId: string;
  name: string;
  category: GroceryCategory;
  price: number | null;
  createdAt: string;
};

export type BoughtList = {
  id: string;
  name: string;
  location: string | null;
  groceryListId: string;
  createdAt: string;
  items?: BoughtItem[];
};
