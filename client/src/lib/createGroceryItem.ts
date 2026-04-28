import type { GroceryItem, NewGroceryItemInput } from "../types/grocery";

function newId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createGroceryItem(input: NewGroceryItemInput): GroceryItem {
  return {
    id: newId(),
    name: input.name,
    category: input.category,
    bought: false,
    createdAt: new Date().toISOString(),
  };
}
