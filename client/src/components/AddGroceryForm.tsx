import { useId, useRef, useState, type FormEvent } from "react";
import { ErrorText } from "./ErrorText";
import {
  GROCERY_CATEGORIES,
  getGroceryCategoryLabel,
  type GroceryCategory,
  type NewGroceryItemInput,
} from "../types/grocery";


const defaultCategory: GroceryCategory = "other";

type AddGroceryFormProps = {
  onAdd: (input: NewGroceryItemInput) => void | Promise<void>;
};

export function AddGroceryForm({ onAdd }: AddGroceryFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GroceryCategory>(defaultCategory);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameId = useId();
  const nameErrorId = `${nameId}-error`;
  const categoryId = useId();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNameError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return;
    }
    try {
      await onAdd({ name: trimmed, category });
    } catch {
      return;
    }
    setName("");
    setCategory(defaultCategory);
    nameInputRef.current?.focus();
  }

  return (
    <form
      className="add-grocery-form"
      onSubmit={onSubmit}
      noValidate
      aria-label="Add grocery item"
    >
      <div className="add-grocery-form__row">
        <div className="field field-inline">
          <label htmlFor={nameId}>Name</label>
          <input
            ref={nameInputRef}
            id={nameId}
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? nameErrorId : undefined}
            autoComplete="off"
          />
        </div>
        <div className="field field-inline">
          <label htmlFor={categoryId}>Category</label>
          <select
            id={categoryId}
            name="category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as GroceryCategory)
            }
          >
            {GROCERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {getGroceryCategoryLabel(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="add-grocery-form__submit">
          <button type="submit">Add</button>
        </div>
      </div>
      <ErrorText id={nameErrorId} message={nameError} />
    </form>
  );
}
