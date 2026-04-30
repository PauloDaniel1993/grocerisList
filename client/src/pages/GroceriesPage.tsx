import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createGroceryItemForList,
  getGroceryItems,
  getGroceryList,
  updateGroceryItemInList,
} from "../api/client";
import { AddGroceryForm } from "../components/AddGroceryForm";
import { GroceryFilter } from "../components/GroceryFilter";
import { GroceryList } from "../components/GroceryList";
import { filterGroceries } from "../lib/filterGroceries";
import type { GroceryItem } from "../types/grocery";
import type { GroceryFilter as GroceryFilterValue } from "../types/grocery";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | { status: "ok" };

export function GroceriesPage() {
  const { listId } = useParams<{ listId: string }>();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [listName, setListName] = useState("");
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [itemError, setItemError] = useState<string | null>(null);
  const [filter, setFilter] = useState<GroceryFilterValue>("all");
  const visibleItems = filterGroceries(items, filter);

  useEffect(() => {
    if (!listId) {
      setLoad({ status: "notFound" });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoad({ status: "loading" });
      setItems([]);
      try {
        const [list, itemList] = await Promise.all([
          getGroceryList(listId),
          getGroceryItems(listId),
        ]);
        if (cancelled) return;
        setListName(list.name);
        setItems(itemList);
        setLoad({ status: "ok" });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load list";
        if (msg === "List not found" || /not found/i.test(msg)) {
          setLoad({ status: "notFound" });
        } else {
          setLoad({ status: "error", message: msg });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listId]);

  if (!listId || load.status === "notFound") {
    return (
      <div className="page">
        <p role="alert">List not found.</p>
        <p>
          <Link to="/grocery-lists">Back to my lists</Link>
        </p>
      </div>
    );
  }

  if (load.status === "loading") {
    return (
      <div className="page">
        <p>Loading</p>
      </div>
    );
  }

  if (load.status === "error") {
    return (
      <div className="page">
        <p role="alert">{load.message}</p>
        <p>
          <Link to="/grocery-lists">Back to my lists</Link>
        </p>
      </div>
    );
  }

  function handleToggleBought(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItemError(null);
    void (async () => {
      try {
        const updated = await updateGroceryItemInList(listId, id, {
          bought: !item.bought,
        });
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      } catch (e) {
        setItemError(
          e instanceof Error ? e.message : "Could not update this item"
        );
      }
    })();
  }

  return (
    <div className="page">
      <p className="grocery-list__back">
        <Link to="/grocery-lists">My lists</Link>
      </p>
      <h1>{listName || "Grocery list"}</h1>
      <AddGroceryForm
        onAdd={async (input) => {
          setItemError(null);
          try {
            const item = await createGroceryItemForList(listId, input);
            setItems((prev) => [...prev, item]);
          } catch (e) {
            setItemError(
              e instanceof Error ? e.message : "Could not add this item"
            );
          }
        }}
      />
      {itemError ? (
        <p className="error" role="alert">
          {itemError}
        </p>
      ) : null}
      <GroceryFilter value={filter} onChange={setFilter} />
      <GroceryList
        items={visibleItems}
        filter={filter}
        onToggleBought={handleToggleBought}
      />
    </div>
  );
}
