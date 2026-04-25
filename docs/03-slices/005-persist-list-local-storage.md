# Slice 005: Persist List in Local Storage

## Goal

Save grocery items in browser local storage so the list survives refreshes.

## User story

As a shopper, I want my list to remain after refreshing the page so that I do not lose my plan.

## Scope

Included:

- Load initial items from local storage
- Save changes to local storage
- Handle invalid stored data safely

Not included:

- Cloud sync
- User accounts
- Sharing

## Acceptance criteria

- Items remain after page refresh
- Adding an item updates stored data
- Toggling bought state updates stored data
- Broken local storage data does not crash the app
