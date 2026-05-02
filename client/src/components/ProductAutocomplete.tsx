import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { getPriceHistoryProducts } from "@/api/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GroceryCategory } from "@/types/grocery";
import type { PriceHistoryProduct } from "@/types/priceHistory";

export type ProductAutocompleteProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onSelectProduct?: (product: {
    name: string;
    category: GroceryCategory;
  }) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

const LISTBOX_ID = "product-autocomplete-suggestions";

export const ProductAutocomplete = forwardRef<
  HTMLInputElement,
  ProductAutocompleteProps
>(function ProductAutocomplete(
  {
    id,
    name,
    value,
    onChange,
    onBlur,
    onSelectProduct,
    disabled,
    placeholder,
    className,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  },
  ref
) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [products, setProducts] = useState<PriceHistoryProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const norm = (s: string) => s.trim().toLowerCase();
  const suggestions = useMemo(() => {
    const q = norm(value);
    if (!q) return products;
    return products.filter((p) => norm(p.name).includes(q));
  }, [products, value]);

  const loadProducts = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    setLoadError(null);
    try {
      setProducts(await getPriceHistoryProducts());
      setLoaded(true);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load products");
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  useEffect(() => {
    if (open && !loaded && !loading) {
      void loadProducts();
    }
  }, [open, loaded, loading, loadProducts]);

  useEffect(() => {
    if (open) {
      setHighlighted(0);
    }
  }, [open, value, suggestions.length]);

  useEffect(() => {
    if (!open) return;
    function handleDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(t)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocMouseDown);
    return () => document.removeEventListener("mousedown", handleDocMouseDown);
  }, [open]);

  function applySelection(p: PriceHistoryProduct) {
    onChange(p.name);
    onSelectProduct?.({ name: p.name, category: p.category });
    setOpen(false);
    innerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (e.key === "ArrowDown" && !disabled) {
        setOpen(true);
        void loadProducts();
        e.preventDefault();
      }
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      const pick = suggestions[highlighted];
      if (pick) {
        e.preventDefault();
        applySelection(pick);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <Input
        ref={innerRef}
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? LISTBOX_ID : undefined}
        aria-activedescendant={
          open && suggestions[highlighted]
            ? `${LISTBOX_ID}-opt-${highlighted}`
            : undefined
        }
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn("h-11", className)}
        onChange={(e) => {
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          void loadProducts();
        }}
        onBlur={() => {
          onBlur?.();
        }}
        onKeyDown={handleKeyDown}
      />
      {loadError ? (
        <p className="mt-1 text-xs text-destructive" role="status">
          {loadError}
        </p>
      ) : null}
      {open && suggestions.length > 0 ? (
        <div
          id={LISTBOX_ID}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          <ScrollArea className="max-h-60">
            <ul className="p-1">
              {suggestions.map((p, i) => (
                <li
                  key={`${i}-${p.name}`}
                  id={`${LISTBOX_ID}-opt-${i}`}
                  role="option"
                  aria-selected={i === highlighted}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                      i === highlighted
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applySelection(p)}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
});
