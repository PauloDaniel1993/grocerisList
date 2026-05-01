import {
  getEmptyGroceryListMessage,
  type GroceryFilter,
  type GroceryItem,
} from "../types/grocery";
import { EmptyGroceries } from "./EmptyGroceries";
import { GroceryItemRow } from "./GroceryItemRow";

type GroceryListProps = {
  items: GroceryItem[];
  onToggleBought: (id: string) => void;
  filter?: GroceryFilter;
};

export function GroceryList({
  items,
  onToggleBought,
  filter = "all",
}: GroceryListProps) {
  if (items.length === 0) {
    return <EmptyGroceries message={getEmptyGroceryListMessage(filter)} />;
  }
  return (
    <ul role="list" aria-label="Grocery items" className="flex flex-col gap-2">
      {items.map((item) => (
        <GroceryItemRow key={item.id} item={item} onToggleBought={onToggleBought} />
      ))}
    </ul>
  );
}
