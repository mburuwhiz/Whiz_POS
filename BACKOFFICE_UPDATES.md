# Back Office Updates

## 1. UI & Experience
- **Modern Interface**:
  - Update `views/layout.ejs` (or main template) to use a modern sidebar + header layout.
  - Use a consistent color scheme (Slate/Blue) matching the Desktop/Mobile apps.
  - Responsive: Ensure hamburger menu works on mobile browsers.
- **Search Suggestions**:
  - Add `<datalist>` elements to all search inputs (Products, Users, Sales) to suggest existing values.

## 2. Reports Page
- **Missing Features**:
  - **Export**: Add "Export to CSV/PDF" buttons for reports.
  - **Filters**: Add Date Range Picker (Start/End Date) and Payment Method filter.
  - **Visuals**: Add Charts (Sales over time, Payment method distribution) using `Chart.js`.
- **Logic**:
  - Ensure "Net Profit" calculation correctly deducts Salaries and Expenses.
  - Fix any aggregations that might be missing "Credit" sales.

## 3. Inventory & Products
- **Sorting**: Arrange items by sales frequency (Most Sold -> Least Sold) in the default view.
- **Consistency**: Ensure Category dropdown matches the Desktop App (Coffee, Pastry, Food, Beverage, Other).

## 4. Stability & API
- **Sync Payload**: Ensure the server can handle the "Optimized" mobile payload (i.e., if mobile sends minimal item data, server should handle it).
- **Error Handling**:
  - Fix any `E11000` (Duplicate Key) errors by sanitizing input (e.g. `email: null` instead of empty string).
  - Ensure large payloads don't crash the server (body-parser limit).

---
**Implementation Checklist:**
- [ ] Update `views/reports.ejs` with charts and filters.
- [ ] Add `<datalist>` to `views/inventory.ejs` search.
- [ ] Verify `apiController.js` handles sync correctly.
- [ ] Style update for `main.css` / Tailwind classes.
