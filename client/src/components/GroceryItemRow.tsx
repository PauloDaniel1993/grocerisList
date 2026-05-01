import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getGroceryCategoryLabel, type GroceryItem } from "../types/grocery";

type GroceryItemRowProps = {
  item: GroceryItem;
  onToggleBought: (id: string) => void;
};

export function GroceryItemRow({ item, onToggleBought }: GroceryItemRowProps) {
  return (
    <li
      className="flex min-h-11 items-center gap-3 rounded-md border bg-card p-3 shadow-sm transition-colors hover:bg-accent/40"
    >
      <Checkbox
        className="h-5 w-5"
        checked={item.bought}
        onCheckedChange={() => onToggleBought(item.id)}
        aria-label={`Mark ${item.name} as ${item.bought ? "not bought" : "bought"}`}
      />
      <span
        className={cn(
          "flex-1 text-sm",
          item.bought && "text-muted-foreground line-through opacity-50"
        )}
      >
        {item.name}
      </span>
      <Badge variant="secondary" className="shrink-0">
        {getGroceryCategoryLabel(item.category)}
      </Badge>
    </li>
  );
}
