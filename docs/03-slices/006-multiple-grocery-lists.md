# Slice 006 — Multiple grocery lists (per user)

## Goal

Signed-in users can create more than one grocery list, see all of their lists on a single page, open a list to manage items (add, mark bought, filter) as in earlier slices, and delete a list. Each user only sees and mutates their own lists; data is stored in the backend (Prisma + SQLite) and scoped by session.

## In scope

- `GroceryList` and `GroceryItem` models with `userId` / `listId` ownership.
- REST API under `/api/grocery-lists` and nested item routes (see `docs/02-architecture/api-design.md`).
- Client routes: `/grocery-lists` (index), `/grocery-lists/:listId` (detail). Old `/groceries` redirects to `/grocery-lists`.
- Delete list (and cascade items).

## Not in scope

- Renaming a list (can be a follow-up).
- Sharing lists between users or public links.
- Offline or localStorage sync for lists (Slice 005 remains separate; new data is server-backed).
- Sorting or searching lists beyond default order (newest first).

## Done when

- Creating two lists as user A does not show them for user B (API returns 404 for the other’s ids).
- List page shows all of the user’s lists; detail page loads items from the API and add/toggle persist.
