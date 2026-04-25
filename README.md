# Groceries List Web App - Cursor Workflow Example

This repository is a documentation-first guide for building a groceries list web app with Cursor.

The purpose of this application is to handle the creation and use of groceries lists and have a reporto of prices and change for each product/category of products 

## App idea

A user can manage grocery lists, add grocery items, mark items as bought, and filter items by category or status.

## Docker

- **API** (from repo root): `docker build -f server/Dockerfile .` then run with `SESSION_SECRET` set, `DATABASE_URL` (default `file:/app/data/app.db`), and a volume on `/app/data`.
- **Web**: `docker build -f client/Dockerfile .` (static site; expects `/api` to be proxied or same-origin).
- **Compose** (API + nginx on port 80): `docker compose up --build`. Set `SESSION_SECRET` in the environment. Seeded users are not created automatically; run `npm run prisma:seed -w server` against your database or use a dev database file as needed.

## Monorepo (Slice 000)

- `client/`: Vite + React (UI; proxies `/api` in dev to the server on port 3001).
- `server/`: Express + Prisma (SQLite) + `express-session` for login and user APIs.
- **Dev**: from the repository root, copy `server/.env.example` to `server/.env` (or use the same variables), then run `npm run dev`. Sign in with seeded users (default password `password123!` unless overridden): `user@example.com` (user), `admin@example.com` (admin). Seed: `npm run prisma:seed -w server` after a fresh DB.
- **Tests** (from root): `npm test`. Server tests use `server/prisma/vitest.db`.

## How to use with Cursor

1. Open this folder in Cursor.
2. Review the files in `docs/`.
3. For auth and user flows, see `docs/02-architecture/auth.md` and the implemented contracts in `docs/02-architecture/api-design.md`.
4. Grocery list slices start at `docs/03-slices/001-create-basic-list.md`.
5. In Cursor chat, reference the slice file and ask Cursor to implement only that slice.
6. Review the diff, run tests, then move to the next slice.

Example Cursor prompt:

```text
Read @docs/02-architecture/architecture-summary.md
Read @docs/02-architecture/decisions.md
Read @docs/03-slices/001-create-basic-list.md

Implement only Slice 001.
Before editing, summarize the files you will touch.
After editing, list the tests I should run.
```

## Recommended slice order

0. (Implemented) Create login & session: see `auth.md` and `api-design.md` (app code in `client/`, `server/`)
1. `001-create-basic-list.md`
2. `002-add-grocery-item.md`
3. `003-mark-item-bought.md`
4. `004-filter-items.md`
5. `005-persist-list-local-storage.md`
