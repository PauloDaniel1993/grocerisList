# Architecture Summary

## Frontend

- Single-page web app
- React are acceptable for implementation
- Keep state with zustand if needed. up to two levels, use prop drilling
- Prefer small components over large page files

## Backend

- Slice 000 introduces a Node + Express API with Prisma + SQLite for auth/session and user management (see ADR 004 in `decisions.md`).
- Grocery slices (001–004) stay client-side: hardcoded sample data, in-memory state, no grocery endpoints yet.
- Slice 005 introduces local storage persistence on the client. Backend persistence for groceries is a future enhancement (see planned contracts in `api-design.md`).

## Data model

```ts
type GroceryItem = {
  id: string
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
