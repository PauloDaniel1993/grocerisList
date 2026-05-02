# API Design

Use the app's existing API style if one exists. If no API style exists yet, Slice 000 may introduce the minimal endpoints needed for login and user editing.

## Suggested endpoints for Slice 000

```text
POST  /api/auth/login
GET   /api/users/me
PATCH /api/users/me
GET   /api/admin/users
GET   /api/admin/users/:userId
PATCH /api/admin/users/:userId
```

`POST /api/auth/logout` (Slice 000) is supported for sign-out; it is not a listing requirement but is required for a usable flow.

## Response style

Prefer predictable JSON responses.

Successful responses should return the requested resource or action result.

Validation and authorization failures should return clear errors that can be shown in the UI.

## JSON contracts (Slice 000)

### User in responses

Omit `passwordHash` in all `User` objects.

```ts
type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  createdAt: string
  updatedAt: string
}
```

### `POST /api/auth/login`

- Request: `{ "email": string, "password": string }`
- Success `200`: `{ "user": User }`
- Error `400`: `{ "error": string }` (e.g. missing email or password)
- Error `401`: `{ "error": string }` (invalid email or password)

### `POST /api/auth/logout`

- Request: (empty body)
- Success `204`: no body

### `GET /api/users/me`

- Success `200`: `{ "user": User }`
- Error `401`: `{ "error": string }`

### `PATCH /api/users/me`

- Request: `{ "name": string }`
- Success `200`: `{ "user": User }`
- Error `400` / `401`: `{ "error": string }`

### `GET /api/admin/users`

- Success `200`: `{ "users": User[] }`
- Error `401` / `403`: `{ "error": string }`

### `GET /api/admin/users/:userId`

- Success `200`: `{ "user": User }`
- Error `401` / `403`: `{ "error": string }`
- Error `404`: `{ "error": string }`

### `PATCH /api/admin/users/:userId`

- Request: `{ "name"?: string, "role"?: "user" | "admin" }` (at least one field)
- Success `200`: `{ "user": User }`
- Error `400` / `401` / `403` / `404`: `{ "error": string }`

## Response style (errors)

`error` is a short, human-readable string suitable for inline form or toast messages when appropriate.

## Grocery contracts (Slice 006 — list-scoped)

All endpoints below require an authenticated session (same session cookie as Slice 000). Unauthenticated requests return `401 { "error": string }`. Each list belongs to the signed-in user; accessing another user’s list id returns `404 { "error": string }` (not `403`, to avoid leaking existence).

### Types

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
  category: "produce" | "dairy" | "bakery" | "frozen" | "household" | "other"
  bought: boolean
  createdAt: string
}

type BoughtList = {
  id: string
  name: string
  location: string | null
  groceryListId: string
  createdAt: string
  items?: BoughtItem[]
}

type BoughtItem = {
  id: string
  boughtListId: string
  name: string
  category: GroceryItem["category"]
  price: number | null
  createdAt: string
}
```

### `GET /api/grocery-lists`

- Success `200`: `{ "lists": GroceryList[] }` (newest first)

### `POST /api/grocery-lists`

- Request: `{ "name": string }` (non-empty after trim; max length enforced server-side)
- Success `201`: `{ "list": GroceryList }`
- Error `400`: `{ "error": string }`

### `GET /api/grocery-lists/:listId`

- Success `200`: `{ "list": GroceryList }`
- Error `404`: `{ "error": string }`

### `DELETE /api/grocery-lists/:listId`

- Deletes the list and all of its items (cascade).
- Success `204`: no body
- Error `404`: `{ "error": string }`

### `GET /api/grocery-lists/:listId/items`

- Success `200`: `{ "items": GroceryItem[] }`
- Error `404`: `{ "error": string }`

### `POST /api/grocery-lists/:listId/items`

- Request: `{ "name": string, "category": GroceryItem["category"] }`
- Success `201`: `{ "item": GroceryItem }`
- Error `400` / `404`: `{ "error": string }`

### `PATCH /api/grocery-lists/:listId/items/:itemId`

- Request: `{ "bought"?: boolean, "name"?: string, "category"?: GroceryItem["category"] }` (at least one field)
- Success `200`: `{ "item": GroceryItem }`
- Error `400` / `404`: `{ "error": string }`

### `DELETE /api/grocery-lists/:listId/items/:itemId`

- Success `204`: no body
- Error `404`: `{ "error": string }`

Filtering (Slice 004) stays client-side over the loaded items; there is no filter query parameter.

### `POST /api/grocery-lists/:listId/end-grocery`

- Creates a new bought list from the current bought items, then deletes those bought items from the source grocery list.
- Request: `{ "location"?: string }`
- Success `201`: `{ "boughtList": BoughtList & { items: BoughtItem[] } }`
- Error `400`: `{ "error": string }` when there are no bought items
- Error `404`: `{ "error": string }`

## Bought list contracts

All bought-list endpoints require an authenticated session. Bought lists belong to the signed-in user; accessing another user’s bought list returns `404 { "error": string }`.

### `GET /api/bought-lists`

- Success `200`: `{ "boughtLists": (BoughtList & { items: BoughtItem[] })[] }` (newest first)

### `GET /api/bought-lists/:boughtListId`

- Success `200`: `{ "boughtList": BoughtList & { items: BoughtItem[] } }`
- Error `404`: `{ "error": string }`

### `PATCH /api/bought-lists/:boughtListId`

- Request: `{ "location": string | null }`
- Success `200`: `{ "boughtList": BoughtList & { items: BoughtItem[] } }`
- Error `400` / `404`: `{ "error": string }`

### `PATCH /api/bought-lists/:boughtListId/items/:itemId`

- Request: `{ "price"?: number | null, "category"?: BoughtItem["category"] }` (at least one field)
- Success `200`: `{ "item": BoughtItem }`
- Error `400` / `404`: `{ "error": string }`

### `DELETE /api/bought-lists/:boughtListId`

- Deletes the bought list and all of its saved price records (cascade).
- Success `204`: no body
- Error `404`: `{ "error": string }`

### Legacy (not implemented)

The earlier flat `/api/groceries` contract was superseded by list-scoped routes above.
