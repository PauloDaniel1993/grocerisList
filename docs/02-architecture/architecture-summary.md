# Architecture Summary

## Frontend

- Single-page web app
- React are acceptable for implementation
- Keep state with zustand if needed. up to two levels, use prop drilling
- Prefer small components over large page files

## Backend

- Slice 000 introduces a Node + Express API with Prisma + SQLite for auth/session and user management (see ADR 004 in `decisions.md`).
- Grocery slices (001–004) were implemented client-first (sample data, then in-memory state, then filters). Slice 005 covers local storage for a single list on the client.
- Slice 006 adds Prisma models `GroceryList` and `GroceryItem`, list-scoped REST routes under `/api/grocery-lists`, and ownership by `User` via the session. See contracts in `api-design.md`.

## Data model

```ts
type GroceryList = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

type GroceryItem = {
  id: string
  listId: string
  name: string
  category: GroceryCategory
  bought: boolean
  createdAt: string
}

type GroceryCategory =
  | 'produce'
  | 'dairy'
  | 'bakery'
  | 'frozen'
  | 'household'
  | 'other'
```

## UI rules

- Use clear empty states
- Keep forms simple
