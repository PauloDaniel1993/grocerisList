# Slice 000: Create Login Flow

## Goal

Create a login page, an admin user-management page, and a user profile page where users can edit their own details.

This slice establishes the basic authentication and user-management flow for the groceries list web app.

## User stories

As a user, I want to log in securely so that I can access my grocery lists and manage my account details.

As a user, I want to edit my own profile details so that my account information stays up to date.

As an admin, I want to manage users so that I can maintain access to the application.

## Scope

Included:

- Create a login page
- Add basic login form validation
- Authenticate users using the existing or planned project pattern
- Redirect logged-in users to the grocery lists area
- Create a profile page for the current user
- Allow users to edit their own allowed profile details
- Create an admin users page
- Allow admins to view users
- Allow admins to edit basic user details
- Add role-aware access control for admin-only pages
- Add loading, success, and error states
- Add tests for login, profile editing, and admin user editing when a test setup exists

Not included:

- Password reset flow
- Email verification
- User registration or sign-up
- Two-factor authentication
- Social login
- Advanced permissions beyond `user` and `admin`
- Deleting users
- Suspending users
- Audit logs
- Grocery list creation or editing
- Cloud sync for grocery lists

## Acceptance criteria

- A user can open the login page
- A user can submit email and password
- Empty email or password shows a validation error
- Invalid credentials show a clear error message
- Valid credentials log the user in
- After login, the user is redirected to the grocery lists page or dashboard
- A logged-in user can open their profile page
- A logged-in user can edit their own name and other allowed profile details
- Profile changes are saved successfully
- Non-admin users cannot access the admin users page
- Admin users can open the admin users page
- Admin users can see a list of users
- Admin users can edit basic user details
- The app prevents users from editing another user's details unless they are an admin
- Relevant loading, success, and error states are shown
- Tests cover successful login when a test setup exists
- Tests cover failed login when a test setup exists
- Tests cover profile editing when a test setup exists
- Tests cover admin-only access protection when a test setup exists
- Tests cover admin user editing when a test setup exists

## Relevant docs

- `docs/00-overview/product-vision.md`
- `docs/01-requirements/feature-list.md`
- `docs/01-requirements/users-and-roles.md`
- `docs/02-architecture/architecture-summary.md`
- `docs/02-architecture/auth.md`
- `docs/02-architecture/api-design.md`
- `docs/02-architecture/data-model.md`
- `docs/02-architecture/decisions.md`

## Data model

Use the existing user model if one already exists. If not, use this minimal model for this slice:

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

Editable by the user:

- `name`
- allowed profile fields already supported by the app

Editable by admin:

- `name`
- `email`
- `role`, only if supported by the existing authorization model

Not editable in this slice:

- `id`
- `createdAt`
- `updatedAt`
- password changes

## Suggested routes

Use the project's existing routing conventions. If no convention exists, use:

```text
/login
/account/profile
/admin/users
/admin/users/:userId
```

## Suggested API behavior

Use the project's existing API conventions. If no convention exists, use:

```text
POST  /api/auth/login
GET   /api/users/me
PATCH /api/users/me
GET   /api/admin/users
GET   /api/admin/users/:userId
PATCH /api/admin/users/:userId
```

## Implementation tasks

- [ ] Create login page
- [ ] Add login form validation
- [ ] Add login API call or connect to existing auth service
- [ ] Store authenticated session using the existing project pattern
- [ ] Redirect logged-in users after successful login
- [ ] Add profile page for current user
- [ ] Add profile edit form
- [ ] Add API support for updating current user details
- [ ] Add admin users page
- [ ] Add admin user detail/edit page or inline edit flow
- [ ] Add API support for admin user listing
- [ ] Add API support for admin user editing
- [ ] Add route protection for logged-in-only pages
- [ ] Add route protection for admin-only pages
- [ ] Add loading, success, and error states
- [ ] Add or update tests
- [ ] Update relevant docs if implementation choices differ from this slice

## Cursor prompt

Read this slice first:

- `docs/03-slices/000-create-login-flow.md`

Also read the relevant architecture and requirements docs:

- `docs/00-overview/product-vision.md`
- `docs/01-requirements/feature-list.md`
- `docs/01-requirements/users-and-roles.md`
- `docs/02-architecture/architecture-summary.md`
- `docs/02-architecture/auth.md`
- `docs/02-architecture/api-design.md`
- `docs/02-architecture/data-model.md`
- `docs/02-architecture/decisions.md`

Implement Slice 000: Create Login Flow.

Rules:

- Implement only this slice
- Follow the existing project patterns
- Do not implement grocery list features in this slice
- Do not add registration, password reset, email verification, or social login
- Do not refactor unrelated code
- Keep changes small and reviewable
- Add or update tests for the acceptance criteria when a test setup exists
- Add route protection for authenticated pages
- Add role protection for admin-only pages
- Use the existing user/auth model if one already exists
- Before editing, summarize the files you expect to touch
- After editing, list what changed and which tests should be run
