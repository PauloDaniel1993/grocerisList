# Auth Architecture

Slice 000 introduces authentication and role-aware access control.

## Principles

- Keep the first auth implementation simple.
- Use the existing app framework's routing and session conventions.
- Protect authenticated pages from anonymous users.
- Protect admin pages from non-admin users.
- Avoid adding registration, password reset, two-factor authentication, or social login in Slice 000.

## Required behavior

- Anonymous users can access `/login`.
- Authenticated users should be redirected away from `/login` when already signed in.
- Authenticated users can access `/account/profile`.
- Only admin users can access `/admin/users`.

## Session guidance

Use the existing session pattern if the app already has one. If not, implement the simplest safe approach supported by the chosen framework and document the choice in `docs/02-architecture/decisions.md`.
