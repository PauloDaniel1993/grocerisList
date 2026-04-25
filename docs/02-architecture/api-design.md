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

## Grocery contracts (planned)

Slices 001–004 are implemented entirely on the client (hardcoded sample data in Slice 001, then in-memory state). Slice 005 adds local storage persistence. These endpoints are not implemented yet; they document the contract a future backend slice would expose so the client can migrate without reshaping data.

### `GroceryItem` in responses

```ts
type GroceryItem = {
  id: string
  name: string
  category: "produce" | "dairy" | "bakery" | "frozen" | "household" | "other"
  bought: boolean
  createdAt: string
}
```

All grocery endpoints below require an authenticated session (same session cookie as Slice 000). Unauthenticated requests return `401 { "error": string }`.

### `GET /api/groceries`

- Used by Slice 001 (view list) once a backend exists.
- Success `200`: `{ "items": GroceryItem[] }`

### `POST /api/groceries`

- Used by Slice 002 (add item).
- Request: `{ "name": string, "category": GroceryItem["category"] }`
- Success `201`: `{ "item": GroceryItem }` (server assigns `id`, `bought: false`, `createdAt`)
- Error `400`: `{ "error": string }` (e.g. missing or invalid name/category)

### `PATCH /api/groceries/:itemId`

- Used by Slice 003 (mark bought / unbought) and later edits.
- Request: `{ "bought"?: boolean, "name"?: string, "category"?: GroceryItem["category"] }` (at least one field)
- Success `200`: `{ "item": GroceryItem }`
- Error `400` / `404`: `{ "error": string }`

### `DELETE /api/groceries/:itemId`

- Used by a future delete interaction.
- Success `204`: no body
- Error `404`: `{ "error": string }`

Filtering (Slice 004) is done client-side over the full list; no dedicated filter endpoint is planned.
