# Architecture Summary

## Frontend

- Single-page web app
- React are acceptable for implementation
- Keep state with zustand if needed. up to two levels, use prop drilling
- Prefer small components over large page files

## Backend

- No backend in the MVP
- Local storage is used in Slice 005

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
