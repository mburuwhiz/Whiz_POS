# Mobile POS Application (APK) Architecture

This document outlines the proposed architecture for the WHIZ POS mobile application. The app will be a Capacitor-based React application, providing a native-like experience on Android devices.

## Guiding Principles

-   **Touch-Friendly UI:** The interface will be designed for touch, with large, intuitive controls and gestures.
-   **Performance:** The app will be optimized for performance on a range of mobile devices.
-   **Feature Parity:** The mobile app will include all the core functionalities of the desktop POS application.
-   **Responsive Design:** The layout will adapt gracefully to both phone and tablet screen sizes, using responsive grids and a collapsible hamburger menu.

## Proposed Pages / Screens

1.  **Login Screen**
    -   **Purpose:** Secure access to the application.
    -   **Components:**
        -   Dropdown to select the user/cashier.
        -   PIN/Password input for authentication.

2.  **POS / Sales Screen (Main Screen)**
    -   **Purpose:** The primary interface for creating new sales.
    -   **Layout (Tablet/Widescreen):**
        -   Left/Center: A scrollable grid of products, filterable by category. A prominent search bar at the top.
        -   Right: The virtual cart/receipt, showing items added, subtotal, tax, and total. Checkout buttons at the bottom.
    -   **Layout (Phone/Small Screen):**
        -   The product grid and cart will be in separate, tabbed views to maximize space. The user can toggle between "Products" and "Cart".

3.  **Checkout Screen**
    -   **Purpose:** Finalize a sale and accept payment.
    -   **Components:**
        -   Clear display of the total amount due.
        -   Selection for payment method (Cash, M-Pesa, Credit).
        -   If "Credit" is chosen, a modal will appear to select or add a credit customer.
        -   Button to complete the transaction, which will trigger receipt printing.

4.  **Menu (Accessed via Hamburger Icon)**
    -   **Purpose:** Navigation to other parts of the application.
    -   **Links:**
        -   Sales (returns to the main POS screen)
        -   Daily Report
        -   Reprint Receipt
        -   Expenses
        -   Credit Customers
        -   Settings
        -   Sync Status
        -   Logout

5.  **Daily Report Screen**
    -   **Purpose:** View the current day's sales summary.
    -   **Components:**
        -   A summary of total sales, transactions, and payment method breakdown.
        -   A button to print the daily closing report.

6.  **Reprint Receipt Screen**
    -   **Purpose:** Find and reprint a previous receipt.
    -   **Components:**
        -   A searchable list of past transactions.
        -   A button next to each transaction to reprint the receipt.

7.  **Expenses Screen**
    -   **Purpose:** Manage expenses on the go.
    -   **Components:**
        -   List of today's expenses.
        -   A form (likely in a modal) to add a new expense.

8.  **Credit Customers Screen**
    -   **Purpose:** View and manage credit customer accounts.
    -   **Components:**
        -   List of credit customers and their outstanding balances.
        -   Ability to view a customer's payment history.

9.  **Settings Screen**
    -   **Purpose:** Configure app and hardware settings.
    -   **Components:**
        -   Printer configuration (select Bluetooth/Wi-Fi printer).
        -   Sync settings and status indicator.

## Data Synchronization Strategy

-   **Local First:** The mobile application will prioritize using its local storage (via Zustand persist or a similar solution) for all operations to ensure it remains fully functional offline.
-   **Background Sync:**
    -   The app will attempt to sync with the back-office REST API whenever it has an active internet connection.
    -   A queue system will be implemented to store any transactions or changes made while offline.
    -   When online, the app will process the queue, sending the data to the back-office and pulling down any updates (e.g., new products).
-   **User Feedback:** The UI will include a clear indicator of the current sync status (e.g., a cloud icon that is green when synced, orange when syncing, and red when offline).
