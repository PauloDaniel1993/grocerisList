# Architecture Decisions

## ADR 001: Start with a client-side app

Status: Accepted

Reason:

The MVP does not need accounts or sharing, so a client-side implementation is simpler and faster.

## ADR 002: Use vertical slices

Status: Accepted

Reason:

Each feature should be implemented as a small reviewable increment.

## ADR 003: Local storage comes after core interactions

Status: Accepted

Reason:

The first slices should focus on behavior. Persistence is added later to avoid mixing concerns too early.

## ADR 004: Slice 000 – Vite client and Express + Prisma server

Status: Accepted

Reason:

- Slice 000 (login, session, roles) needs a real server: cookie-based sessions, password hashing, and role checks. A pure client-only mock would not meet `docs/02-architecture/auth.md` or a stable `api-design.md` contract.
- **Client**: Vite + React, React Router, Zustand. In development the Vite dev server proxies `/api` to the API server on port 3001 so cookies stay same-site.
- **Server**: Node + Express, JSON body, `express-session` with an in-memory `MemoryStore` in Slice 000 (sufficient for local dev; replace with a persistent store when deploying or scaling).
- **Data**: Prisma with SQLite, bcrypt-hashed passwords, seed users for a normal and an admin account (see `server/.env.example` and the seed script).
- **Not in this ADR / slice**: registration, password reset, email verification, social login, full CSRF hardening (same-origin and `SameSite=lax` cookies in dev only—revisit for cross-site forms later).
