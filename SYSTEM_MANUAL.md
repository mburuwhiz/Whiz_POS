# WHIZ POS System Manual

**Version:** 5.2.3
**Last Updated:** 2025

---

## Table of Contents

1.  [Introduction](#introduction)
2.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Initial Setup](#initial-setup)
    *   [Authentication](#authentication)
3.  [Main Point of Sale (POS)](#main-point-of-sale-pos)
    *   [Product Grid](#product-grid)
    *   [Cart & Orders](#cart--orders)
    *   [Checkout Process](#checkout-process)
4.  [Management Modules](#management-modules)
    *   [Inventory Management](#inventory-management)
    *   [Sales History](#sales-history)
    *   [Expenses](#expenses)
    *   [Salaries](#salaries)
    *   [Credit Customers](#credit-customers)
5.  [Reports & Analytics](#reports--analytics)
    *   [Daily Sales Report](#daily-sales-report)
    *   [Closing Report](#closing-report)
    *   [Dashboard](#dashboard)
6.  [System Configuration](#system-configuration)
    *   [Settings](#settings)
    *   [Sync & Network](#sync--network)
    *   [Developer Tools](#developer-tools)
7.  [Mobile App Integration](#mobile-app-integration)

---

## Introduction

**WHIZ POS** is a modern, offline-first Point of Sale ecosystem designed for cafés, restaurants, and retail businesses. It consists of three interconnected components:

1.  **Desktop POS (Electron)**: The primary cashier station. It stores data locally, handles printing, and acts as a local server for mobile devices.
2.  **Mobile App (Android)**: A companion app for waiters or remote sales. It connects to the Desktop POS via Wi-Fi to send orders and print receipts.
3.  **Back Office (Web)**: A cloud-based dashboard for remote management, analytics, and data backup.

---

## Getting Started

### Prerequisites
*   A Windows, Linux, or macOS computer for the Desktop POS.
*   An 80mm Thermal Receipt Printer (EPSON TM-T20X or compatible).
*   Wi-Fi network (for Mobile App connectivity).

### Initial Setup
When launching the application for the first time, you will be greeted by the **Business Registration** screen.
1.  Enter your **Business Name**, **Address**, and **Phone Number**.
2.  Configure your **Tax Rate** (if applicable).
3.  Set up an **Admin User** and **PIN**.
4.  The system will print a *Startup Invoice* confirming the setup.

### Authentication
The system uses a secure PIN-based login.
*   **Select User**: Choose your name from the dropdown menu (no visual grid).
*   **Enter PIN**: Use the on-screen number pad to enter your 4-digit PIN.
*   **Auto-Logoff**: If enabled in Settings, the system will warn you after a period of inactivity and log you out automatically to secure the terminal.

---

## Main Point of Sale (POS)

The main screen is divided into two sections:

### Product Grid
*   **Categories**: Filter products by selecting categories (e.g., Coffee, Pastry, Food).
*   **Search**: Use the search bar to find products by name.
*   **Touch Interface**: Large product cards are designed for touch screens.

### Cart & Orders
*   **Adding Items**: Tap a product to add it to the cart.
*   **Quantity**: Tap again to increment, or use the `+` / `-` buttons in the cart.
*   **Remove**: Reduce quantity to 0 or use the trash icon to remove an item.
*   **Total**: Real-time calculation of Subtotal, Tax, and Grand Total.

### Checkout Process
Press the **Checkout** button to open the payment modal.
1.  **Payment Methods**:
    *   **CASH**: Standard cash transaction.
    *   **M-PESA**: Records mobile money payments.
    *   **CREDIT**: Assigns the bill to a registered Credit Customer.
2.  **Receipt**:
    *   Automatically prints on the default printer.
    *   Format: 80mm width, 3mm/4mm margins, no borders.
    *   Header: `Business Name`, `Location | Phone`.
    *   Details: Date, Receipt #, Payment Method, Served By.

---

## Management Modules

Access these modules via the navigation sidebar.

### Inventory Management
*   **Stock Tracking**: View current stock levels for all products.
*   **Add/Edit Products**: Create new products with Name, Price, Category, and Stock count.
*   **Variance Logs**: Track stock adjustments (shrinkage, wastage, or new stock arrival).

### Sales History
*   **Previous Receipts**: View a list of all past transactions.
*   **Reprint**: Print a duplicate copy of any past receipt (marked "REPRINT").
*   **Mobile Receipts**: A dedicated queue for orders sent from the Mobile App. These can be printed manually if auto-print is disabled.

### Expenses
*   **Record Expense**: Log daily operational costs (e.g., "Milk", "Transport").
*   **Categories**: Categorize expenses for better reporting.
*   **Analysis**: Expenses are deducted from the Gross Profit in reports.

### Salaries
*   **Staff Management**: Manage employee payroll.
*   **Advance vs. Full**: Record salary advances or full month payments.
*   **Impact**: Salary payments are deducted from the Net Profit calculation.

### Credit Customers
*   **Customer Directory**: Manage customers who are allowed to buy on credit.
*   **Balances**: View total credit owed by each customer.
*   **Payments**: Record partial or full payments against a customer's balance.
*   **History**: View a ledger of all credit transactions and repayments.

---

## Reports & Analytics

### Daily Sales Report
A generated report for the current day's activity.
*   **Item Sales**: A detailed table showing `Item Name`, `Quantity Sold`, and `Total Value`.
*   **Totals**: Aggregated totals for Cash, M-Pesa, and Credit sales.

### Closing Report
The "End of Day" procedure.
*   **Generation**: Generates a summary of all sales by payment method.
*   **Printing**: Prints a physical copy for the cashier's records.
*   **Auto-Print**: (Disabled by default on startup in v5.2.3).

### Dashboard
A visual overview of business performance.
*   **Charts**: Weekly sales trends.
*   **Metrics**: Total Revenue, Total Orders, Top Selling Products.

---

## System Configuration

### Settings
*   **Business Profile**: Update Name, Address, and Phone.
*   **Printers**: Select the default thermal printer.
*   **On-Screen Keyboard**: Toggle the virtual keyboard for touchscreens.
*   **M-Pesa**: Configure Paybill/Till numbers to appear on receipts.
*   **Updates**: Check for and download the latest software updates.

### Sync & Network
*   **Status**: Check if the system is Online or Offline.
*   **Sync Queue**: View pending data waiting to be sent to the Cloud Back Office.
*   **Server Config**: View the Desktop Server's IP address and API Key (required for connecting mobile apps).
*   **Connected Devices**: See a live list of mobile devices currently connected to this POS.

### Developer Tools
*   **Access**: Protected by a Developer PIN (Default: `1410399`).
*   **Backup & Restore**:
    *   **Backup**: Download a complete JSON dump of all system data.
    *   **Restore**: Restore the system from a previous backup file.
*   **Direct DB Push**: Force a sync directly to the MongoDB Cloud database (bypassing the API).

---

## Mobile App Integration

The **Whiz POS Mobile App** extends the system's reach.

1.  **Connect**: Scan the QR code in **Sync & Network** settings or enter the IP/API Key manually.
2.  **Functionality**:
    *   Take orders at the table.
    *   Send orders to the Desktop POS for printing.
    *   View products and stock levels.
    *   **Offline Mode**: Works offline and syncs when reconnected to the Wi-Fi.
