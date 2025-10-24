# WHIZ POS v2.0 - Testing Guide

This document provides instructions on how to run and test the two parallel applications currently in the repository.

---

## 1. Testing the Original Express.js Application (Legacy)

This will run the original server on `http://localhost:3000`.

### a) Prerequisites

*   A running MongoDB instance.
*   A `.env` file in the root directory with a valid `MONGO_URI`. You can copy `.env.example` to get started.

### b) Steps to Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Super Admin Seeder (if first time):**
    This script creates the initial Super Admin user based on the credentials in your `.env` file.
    ```bash
    node src/server/scripts/createSuperAdmin.js
    ```

3.  **Start the Server:**
    ```bash
    npm start
    ```

4.  **Access the Application:**
    *   Open your web browser and navigate to `http://localhost:3000/login`.
    *   You can log in with the Super Admin credentials to access the dashboard.

---

## 2. Testing the New NestJS Application & Desktop App

This section describes how to test the new, in-progress system. This involves running the NestJS server and the Electron desktop app in parallel.

### a) Prerequisites

*   A running MongoDB instance.
*   A `.env` file in the `server/` directory with a valid `MONGO_URI`.

### b) Terminal 1: Running the NestJS Server

1.  **Navigate to the Server Directory:**
    ```bash
    cd server
    ```

2.  **Install Dependencies (if first time):**
    ```bash
    npm install
    ```

3.  **Seed the Database (if first time or to reset):**
    This will create a test user (PIN: 1234) and sample products.
    ```bash
    npm run seed
    ```

4.  **Start the Server in Development Mode:**
    ```bash
    npm run start:dev
    ```
    The server will start and listen on `http://localhost:4001`.

### c) Terminal 2: Running the Electron Desktop App

1.  **Navigate to the Desktop Directory:**
    ```bash
    cd desktop
    ```

2.  **Install Dependencies (if first time):**
    ```bash
    npm install
    ```

3.  **Start the App in Development Mode:**
    ```bash
    npm run dev
    ```
    The Electron application window will open.

### d) Testing the Full Application Flow

1.  **First-Time Device Setup:**
    *   Before the first run, ensure there is no `deviceToken` in the application's `localStorage`. You can clear this in the Electron DevTools (`Application > Local Storage`).
    *   On launch, you should see the "Device Setup" screen.
    *   Enter the test API Key: `WHIZ-XXXXX` and click "Link Device".
    *   You should be redirected to the PIN Login screen. A `deviceToken` will now be stored in `localStorage`.
    *   On subsequent launches, the app will skip this step.

2.  **PIN Login:**
    *   The user dropdown should now be populated with "Jane Cashier". Select her.
    *   Use the numeric keypad to enter the PIN: `1234`.
    *   You can press and hold the "eye" icon to the right of the PIN dots to temporarily see the digits you have entered.
    *   Click "Enter". You should be successfully logged in and see the main POS Terminal screen with a professional header.

3.  **Create a Sale:**
    *   The left panel should display a grid of products (Espresso, Latte, etc.).
    *   Click on several products. They should appear in the "Current Order" panel on the right.
    *   The Subtotal, Tax, and Total will update automatically.

4.  **Finalize the Transaction:**
    *   Click the "Cash" or "Card" button.
    *   A SweetAlert2 notification will confirm "Sale complete!".
    *   The "Current Order" panel will clear, ready for the next sale.

5.  **Test Super Admin Functionality (Temporary UI):**
    *   From the main POS view, click the "Super Admin" button in the header.
    *   Use the form to create a new business and its first administrator.
    *   The new business will appear in the "Existing Businesses" list.
    *   Click the "Issue New API Key" button for the new business. A SweetAlert2 popup will display the newly generated, inactive API key.

This confirms that the desktop UI is successfully communicating with the NestJS server, fetching data, and posting new transactions to the database.

---

## 3. Testing New Payment Features (Phase 2)

### a) Testing Credit Payments

1.  **Create a Credit Sale:**
    *   Follow the steps to create a sale.
    *   Instead of "Cash" or "Card", click the "Credit" button.
    *   The sale should be recorded with a payment method of "Credit" and an `isPaid` status of `false`.

2.  **End-of-Day Credit Settlement:**
    *   Navigate to the end-of-day credit management screen.
    *   A list of all unpaid credit transactions should be displayed.
    *   Select one or more transactions and mark them as "Paid".
    *   The `isPaid` status for these transactions should be updated to `true` in the database.

3.  **End-of-Day Summary:**
    *   Generate the end-of-day summary report.
    *   The report should accurately reflect the total sales, with a breakdown of cash, card, and credit payments.
    *   The credit section should show the total amount of credit extended, the amount that has been paid, and the outstanding balance.

### b) Testing M-Pesa Integration

1.  **Create an M-Pesa Sale:**
    *   Follow the steps to create a sale.
    *   Click the "M-Pesa" button.
    *   The system should prompt for the customer's phone number and initiate the M-Pesa transaction.

2.  **Successful Payment:**
    *   Upon successful payment, the sale should be recorded with a payment method of "M-Pesa".

3.  **Failed Payment:**
    *   If the M-Pesa payment fails, the sale should not be recorded, and an appropriate error message should be displayed.
