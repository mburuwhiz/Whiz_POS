# Back-Office Web Application Architecture

This document outlines the proposed architecture for the WHIZ POS back-office web application. The application will be built with Node.js and Express on the backend, using EJS for server-side rendering to ensure fast page loads and SEO friendliness.

## Guiding Principles

-   **Responsive First:** The UI will be fully responsive, utilizing a hamburger menu on smaller screens and a full sidebar on larger screens for a seamless experience on any device.
-   **Modern & Clean UI:** The design will be professional, minimalist, and beautiful, with a focus on usability and clarity.
-   **Data-Driven:** The back-office is the central hub for all business data, providing powerful tools for analysis and management.

## Proposed Pages

1.  **Dashboard (Home Page)**
    -   **Purpose:** Provide an at-a-glance overview of the business's performance.
    -   **Components:**
        -   Key Performance Indicators (KPIs): Total Sales, Total Transactions, Average Transaction Value.
        -   Sales trend chart (e.g., last 7 days).
        -   Top-selling products and categories.
        -   Recent activity feed.

2.  **Sales / Transactions**
    -   **Purpose:** Detailed view of all transactions.
    -   **Components:**
        -   A filterable and searchable table of all sales records.
        -   Columns: Transaction ID, Date/Time, Cashier, Total Amount, Payment Method.
        -   Ability to click on a transaction to see a detailed receipt view.
        -   Date range pickers for filtering.
        -   Export to CSV/PDF functionality.

3.  **Inventory Management**
    -   **Purpose:** Manage products and stock levels.
    -   **Sub-Pages:**
        -   **Products:** A grid or list view of all products. Add, edit, and delete products (including images, price, and category).
        -   **Categories:** Manage product categories.
        -   **Stock Control:** View current stock levels, receive new stock, and view stock history.

4.  **Expense Management**
    -   **Purpose:** Track business expenses.
    -   **Components:**
        -   A table of all expenses with filtering and search.
        -   Form to add a new expense (description, amount, category, date).
        -   Ability to edit or delete existing expenses.

5.  **Credit Management**
    -   **Purpose:** Manage credit customers and their balances.
    -   **Components:**
        -   A list of all credit customers with their current balance.
        -   A detailed view for each customer showing their transaction history and payments.
        -   Functionality to record a new payment against a customer's balance.

6.  **Reports**
    -   **Purpose:** Generate detailed reports for business analysis.
    -   **Available Reports:**
        -   Daily Closing Reports.
        -   Sales Summary (by product, category, or cashier).
        -   Expense Reports.
        -   Inventory Stock Reports.

7.  **User Management**
    -   **Purpose:** Manage staff accounts and permissions.
    -   **Components:**
        -   List of all users.
        -   Add, edit, or deactivate user accounts.
        -   Assign roles (e.g., Admin, Cashier) to control access to features.

8.  **Settings**
    -   **Purpose:** Configure business details and application settings.
    -   **Components:**
        -   Update Business Information (Name, Address, Phone, Receipt Footer).
        -   Manage Payment Options.
        -   Configure tax settings.

## Data Synchronization Strategy

The back-office will serve as the central database (Source of Truth).

-   **Connection & Security:** The Desktop POS and Mobile APK will communicate with the back-office via a secure REST API. All API requests must be authenticated using a secret API Key, which will be sent as a custom header (e.g., `X-API-KEY`). This prevents unauthorized access, as the applications will be deployed in separate environments.
-   **Offline First:**
    -   When the Desktop or Mobile app is **online**, it will fetch the latest data from the back-office and send any new transactions in real-time.
    -   When **offline**, the apps will store all new transactions and data changes locally.
    -   Once connectivity is restored, the apps will automatically sync the queued data with the back-office.
-   **MongoDB's Role:** The MongoDB database connected to the back-office is the permanent, central data store. It is not a temporary storage.
