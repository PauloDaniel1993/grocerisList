# Slice 001: Create Basic List

## Goal

Show a basic grocery list page with a heading, empty state, and a few hardcoded sample items.

## User story

As a shopper, I want to see my grocery list so that I know what I need to buy.

## Scope

Included:

- Page title
- Empty state component
- Grocery item row component
- Hardcoded sample grocery items

Not included:

- Adding new items
- Marking items as bought
- Filtering
- Persistence

## Acceptance criteria

- The page renders a title: `Groceries`
- The page can display grocery items
- Each item shows name and category
- Empty state appears when there are no items
- Code is split into small components where useful

## Relevant docs

- `docs/02-architecture/architecture-summary.md`
- `docs/02-architecture/decisions.md`

## Copilot/Cursor prompt

Implement Slice 001 only.

Rules:

- Use the architecture docs as the source of truth
- Do not implement add, bought, filter, or persistence behavior yet
- Keep the implementation simple
- Add tests if the project already has a test setup
