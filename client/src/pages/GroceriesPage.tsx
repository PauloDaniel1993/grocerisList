import { useState } from "react";
import { AddGroceryForm } from "../components/AddGroceryForm";
import { GroceryFilter } from "../components/GroceryFilter";
import { GroceryList } from "../components/GroceryList";
import { sampleGroceries } from "../data/sampleGroceries";
import { createGroceryItem } from "../lib/createGroceryItem";
import { filterGroceries } from "../lib/filterGroceries";
import type { GroceryFilter as GroceryFilterValue } from "../types/grocery";

export function GroceriesPage() {
  const [items, setItems] = useState(() => [...sampleGroceries]);
  const [filter, setFilter] = useState<GroceryFilterValue>("all");
  const visibleItems = filterGroceries(items, filter);

  function handleToggleBought(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, bought: !it.bought } : it))
    );
  }

  return (
    <div className="page">
      <h1>Groceries</h1>
      <AddGroceryForm
        onAdd={(input) => {
          setItems((prev) => [...prev, createGroceryItem(input)]);
        }}
      />
      <GroceryFilter value={filter} onChange={setFilter} />
      <GroceryList
        items={visibleItems}
        filter={filter}
        onToggleBought={handleToggleBought}
      />
    </div>
  );
}
