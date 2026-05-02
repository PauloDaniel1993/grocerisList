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

## Bought list

```ts
type BoughtList = {
  id: string
  name: string
  location: string | null
  groceryListId: string
  createdAt: string
  items: BoughtItem[]
}

type BoughtItem = {
  id: string
  boughtListId: string
  name: string
  category: GroceryCategory
  price: number | null
  createdAt: string
}
```

Bought lists are purchase snapshots created from bought grocery items. The source grocery items are removed after the snapshot is created.

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
