# Bug Report: Data Disappearance during Sync

## Description
The user reported that manually added data (Expenses, Suppliers, Credit Customers, Inventory) would disappear shortly after creation, except for Users which worked correctly. The application appeared to be erased by synced data.

## Investigation
Upon analyzing the `src/store/posStore.ts` and `electron.cjs` files, the following issues were identified:

1.  **Stale State Closure in `syncFromServer`**:
    The `syncFromServer` function captured the application state (`const state = get()`) at the *beginning* of its execution. It then performed a long-running asynchronous operation (`await window.electron.directDbPull(mongoDbUri)`), which could take several seconds.
    If the user added a new item (e.g., an Expense) during this wait time, the local state would update. However, `syncFromServer` would resume with the *stale* state snapshot it captured earlier. It would then merge the server data with this stale local data (missing the new item) and overwrite the global state, effectively erasing the new item.

2.  **Missing `suppliers` in Sync**:
    The `direct-db-pull` and `direct-db-push` handlers in `electron.cjs` were missing the logic to include the `suppliers` collection. This meant suppliers were never synced to the database, and `syncFromServer` was merging local suppliers with an empty server list (which is generally fine, but exacerbated by the stale state bug).

## Fix Implemented

### 1. Fix Stale State in `posStore.ts`
Modified `syncFromServer` to fetch the **latest** state immediately before the merge operation.

```typescript
// Old Code
syncFromServer: async () => {
  const state = get(); // Captured early
  // ... await DB Pull ...
  const merged = mergeData(state.products, ...); // Used stale state
  set({ products: merged });
}

// New Code
syncFromServer: async () => {
  const configState = get(); // Only use for config/URL
  // ... await DB Pull ...

  const currentState = get(); // CRITICAL: Get FRESH state before merging
  const merged = mergeData(currentState.products, ...); // Use fresh state
  set({ products: merged });
}
```

### 2. Include Suppliers in `electron.cjs`
Updated `direct-db-pull` to fetch `suppliers` from MongoDB and `direct-db-push` to write `suppliers` to MongoDB.

### 3. Product Sorting
Updated `ProductGrid.tsx` to ensure popularity sorting is robust against ID type mismatches (string vs number) by normalizing IDs before lookup.

### 4. Navbar Toggle
Added a "Menu" button to the Header and a `isSidebarCollapsed` state to `posStore` to allow hiding the sidebar for full-width usage.

## Verification
-   **Sync:** `syncFromServer` now uses fresh state, preventing data loss during the sync window.
-   **Suppliers:** Suppliers are now correctly pulled from and pushed to the database.
-   **Navbar:** Users can toggle the sidebar visibility.
