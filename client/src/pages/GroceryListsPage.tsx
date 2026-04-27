import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createGroceryList,
  deleteGroceryList,
  getGroceryLists,
} from "../api/client";
import type { GroceryList } from "../types/groceryList";

export function GroceryListsPage() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [name, setName] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setLists(await getGroceryLists());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load lists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page">
      <h1>My lists</h1>
      {loading ? (
        <p>Loading</p>
      ) : loadError ? (
        <p role="alert">{loadError}</p>
      ) : null}
      <form
        className="grocery-lists__create"
        onSubmit={async (e) => {
          e.preventDefault();
          setActionError(null);
          const trimmed = name.trim();
          if (!trimmed) return;
          try {
            const list = await createGroceryList(trimmed);
            setName("");
            setLists((prev) => [list, ...prev]);
          } catch (err) {
            setActionError(
              err instanceof Error ? err.message : "Could not create list"
            );
          }
        }}
      >
        <label>
          <span className="visually-hidden">New list name</span>
          <input
            type="text"
            name="listName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="List name"
            maxLength={200}
            autoComplete="off"
          />
        </label>
        <button type="submit">Create list</button>
        {actionError ? (
          <p className="error" role="alert">
            {actionError}
          </p>
        ) : null}
      </form>
      {!loading && !loadError && lists.length === 0 ? (
        <p className="empty-groceries" role="status">
          You have no lists yet. Add a name and create one to get started.
        </p>
      ) : null}
      <ul
        className="grocery-lists__list"
        aria-label="Your grocery lists"
      >
        {lists.map((list) => (
          <li key={list.id} className="grocery-lists__row">
            <Link to={`/grocery-lists/${list.id}`} className="grocery-lists__link">
              {list.name}
            </Link>
            <button
              type="button"
              className="grocery-lists__delete"
              onClick={async () => {
                if (!window.confirm("Delete this list and all of its items?")) {
                  return;
                }
                setActionError(null);
                try {
                  await deleteGroceryList(list.id);
                  setLists((prev) => prev.filter((l) => l.id !== list.id));
                } catch (err) {
                  setActionError(
                    err instanceof Error ? err.message : "Could not delete list"
                  );
                }
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
