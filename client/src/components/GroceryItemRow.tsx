import { getGroceryCategoryLabel, type GroceryItem } from "../types/grocery";

type GroceryItemRowProps = {
  item: GroceryItem;
  onToggleBought: (id: string) => void;
};

export function GroceryItemRow({ item, onToggleBought }: GroceryItemRowProps) {
  return (
    <li className={`grocery-row${item.bought ? " grocery-row--bought" : ""}`}>
      <input
        type="checkbox"
        className="grocery-row__checkbox"
        checked={item.bought}
        onChange={() => onToggleBought(item.id)}
        aria-label={`Mark ${item.name} as ${item.bought ? "not bought" : "bought"}`}
      />
      <span className="grocery-name">{item.name}</span>
      <span className="grocery-category">
        {getGroceryCategoryLabel(item.category)}
      </span>
    </li>
  );
}
