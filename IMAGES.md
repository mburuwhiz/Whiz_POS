# Images and Assets Location

This document outlines the locations and usage of various image assets within the Whiz POS ecosystem.

## Cart Placeholder Image
The default image for products without a specific image is `cart.png`.

*   **Source of Truth:** `src/assets/cart.png`
    *   **Usage:** Imported by Desktop App React components (e.g., `ProductGrid.tsx`, `InventoryManagement.tsx`). Vite bundles this.
*   **Mobile App:** `mobile-app/public/cart.png`
    *   **Usage:** Served statically by the Mobile App (Vite). Referenced as `/cart.png`.
*   **Server / Legacy:** `public/assets/cart.png`
    *   **Usage:** Available for static serving if needed by backend templates or legacy code.
*   **Electron Build Asset:** `assets/cart.png`
    *   **Usage:** Can be used by Electron Main process or as a fallback resource.

**Note:** All instances of `cart.png` should be kept in sync.

## Product Images
*   **Storage:** `userData/assets/product_images/` (Electron User Data Directory)
*   **Serving:** Served via `local-asset://` protocol in Desktop App and `/assets/` endpoint in the API Server.

## Other Assets
*   **Logo:** `public/logo.png`
