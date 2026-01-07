# Mobile APK Updates

## 1. Build Fixes & Type Corrections
The following errors must be addressed to ensure a successful build (`npm run build`):
- **Dashboard.tsx Error**: `Property 'product' does not exist on type 'CartItem'`.
  - **Reason**: The `CartItem` interface extends `Product` directly and does not have a nested `product` property.
  - **Fix**: Update `src/pages/Dashboard.tsx` line ~39:
    ```typescript
    // Change from:
    const id = item.product?.id || item.id;
    // To:
    const id = item.id;
    ```
    (Note: If `item` is strictly `CartItem`, it has `id`. If legacy data has nested product, the type definition `CartItem` needs to be updated to `Product & { product?: Product }` or cast as `any`, but `item.id` is the correct property for the defined type).

## 2. UI Updates (Glassmorphic & Modern)
- **Deck View for Receipts**:
  - Implement a "Deck" or "Card Stack" view in `TransactionsPage.tsx` where users can swipe left/right to navigate through their receipts.
  - Show only one receipt at a time with full details.
  - Navigation buttons (Previous/Next) if swipe is hard to implement in web view.
- **Glassmorphism**:
  - Ensure all modals and cards use `backdrop-blur-md`, `bg-white/10`, and white borders (`border-white/20`) to match the "Whiz Pos" aesthetic.
  - "Beautiful" receipts: The receipts shown in the app should look like a digital card (clean fonts, logo, distinct sections) rather than a raw thermal print preview.

## 3. Sync Logic Optimization ("Perfect Sync")
- **Payload Optimization**:
  - When sending transactions to the server (`/api/sync`), strip unnecessary fields from `items`.
  - Only send `{ productId: item.id, quantity: item.quantity, price: item.price }`. Do not send the full Base64 image strings in the transaction payload to reduce size and prevent timeouts.
- **Reliability**:
  - **Queue Management**: Ensure `addToSyncQueue` assigns a unique ID.
  - **Two-Phase Sync**:
    1. **PUSH**: Upload local changes.
    2. **PULL**: Download server changes.
    3. **MERGE**: Smart merging (Server wins for existing, Local wins for new).
    4. **CLEANUP**: Remove pushed items from queue only *after* successful confirmation.
  - **Images**: Do not sync images from Mobile to Desktop. Mobile only *consumes* images.

## 4. Receipt Generation
- **Sharing**:
  - Use `html-to-image` to generate a high-quality image of the receipt.
  - Add "Share" functionality (Web Share API or Capacitor Share) to send via WhatsApp/Email.
- **Visuals**:
  - Include the POS Logo.
  - Use "Best Colors" (e.g., Brand Blue/Emerald for totals).
  - Layout:
    - Header: Logo + Business Name
    - Body: Items Table
    - Footer: Totals + QR Code (optional)

## 5. Sorting & Search
- **Product Sorting**: Sort products by "Most Sold" (Frequency) -> "Least Sold".
  - Logic: Count occurrences in `transactions` and sort the product list.
- **Search Suggestions**:
  - Ensure `<datalist>` is used for search bars (Products, Customers) to aid typing.

---
**Implementation Checklist:**
- [ ] Fix `Dashboard.tsx` type error.
- [ ] Update `TransactionsPage.tsx` to Deck View.
- [ ] Optimize `syncQueue` payload (strip images).
- [ ] Verify `html-to-image` receipt generation.
- [ ] Ensure `MobileReceipts` page filters by current user.
