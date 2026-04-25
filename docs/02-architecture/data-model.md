# Data Model

## Grocery item

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

## User

Slice 000 may introduce this model if one does not already exist:

```ts
type User = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}
```
