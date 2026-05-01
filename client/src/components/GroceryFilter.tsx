import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GROCERY_FILTERS,
  getGroceryFilterLabel,
  type GroceryFilter,
} from "../types/grocery";

type GroceryFilterProps = {
  value: GroceryFilter;
  onChange: (next: GroceryFilter) => void;
};

export function GroceryFilter({ value, onChange }: GroceryFilterProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as GroceryFilter)}
      aria-label="Filter items"
    >
      <TabsList className="grid h-11 w-full grid-cols-3 sm:inline-flex sm:w-auto">
        {GROCERY_FILTERS.map((f) => (
          <TabsTrigger key={f} value={f} className="h-9">
            {getGroceryFilterLabel(f)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
