import type { GroceryCategory } from "./grocery";

export type PriceHistoryProduct = {
  name: string;
  category: GroceryCategory;
};

export type PricePoint = {
  name: string;
  price: number;
  date: string;
  location: string | null;
};
