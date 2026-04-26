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
    <fieldset className="grocery-filter" aria-label="Filter items">
      <legend className="visually-hidden">Filter items</legend>
      <div className="grocery-filter__options">
        {GROCERY_FILTERS.map((f) => (
          <label
            key={f}
            className={`grocery-filter__option${
              value === f ? " grocery-filter__option--active" : ""
            }`}
          >
            <input
              type="radio"
              name="grocery-filter"
              value={f}
              checked={value === f}
              onChange={() => onChange(f)}
            />
            {getGroceryFilterLabel(f)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
