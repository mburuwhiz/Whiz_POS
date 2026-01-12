# Bug Report: Data Disappearance During Sync

## Issue Description
Users reported that manually added data (such as Suppliers, Expenses, Credit Customers, etc.) would disappear shortly after creation. This behavior was consistent across multiple modules but did not affect Users.

## Investigation
Upon investigating the synchronization logic in `src/store/posStore.ts` and the Electron main process `electron.cjs`, two critical issues were identified:

1.  **Race Condition in `syncFromServer`:**
    The `syncFromServer` function in `posStore.ts` was capturing the application state (`get()`) *before* initiating the asynchronous data pull from the server (or local DB).
    -   **Scenario:**
        1.  Sync starts. `currentState` is captured.
        2.  Application awaits the DB/Server response (which can take a few seconds).
        3.  User adds a new item (e.g., a Supplier) during this wait. The state is updated locally.
        4.  Sync completes. The merge logic uses the *stale* `currentState` (from step 1) which does not contain the new item.
        5.  The merge result overwrites the store, effectively deleting the new item.

2.  **Missing Sync Handlers for Suppliers:**
    The `electron.cjs` backend logic for `direct-db-pull` and `direct-db-push` included arrays for `products`, `users`, `expenses`, etc., but completely omitted `suppliers`. This meant supplier data was never persisted to or retrieved from the central database during a direct DB sync.

## Fix Implementation

### 1. Fixed Race Condition in `posStore.ts`
The `syncFromServer` function was updated to fetch the latest state (`const currentState = get();`) *immediately before* the merge operation, ensuring that any data added while the sync was in progress is preserved.

```typescript
// Old (Buggy)
// const currentState = get(); // Captured too early
// ... await fetch ...
// mergeData(currentState...)

// New (Fixed)
// ... await fetch ...
const currentState = get(); // Capture latest state right before merge
mergeData(currentState...)
```

### 2. Added Missing Sync Handlers
Updated `electron.cjs` to include `suppliers` in:
-   `direct-db-push`: Ensuring local suppliers are pushed to the DB.
-   `direct-db-pull`: Ensuring server suppliers are pulled to the app.

### 3. Data Deduplication
To prevent "duplicate key" errors in React and general data messiness, a robust `deduplicateItems` helper was added to `posStore.ts`. This filters out items with duplicate IDs or invalid IDs (`null`, `NaN`) during data loading and synchronization.

## Verification
These fixes ensure that:
-   Data added by the user persists correctly even if a sync operation is running in the background.
-   Supplier data is now properly synchronized.
-   The "React Key Warning" crashes are resolved.
