# WHIZ POS v2.0 - Modern Testing Guide

This document provides a comprehensive guide for setting up and testing the full WHIZ POS v2.0 application stack, including the NestJS server, the Electron desktop app, and the SvelteKit portal.

---

## 1. Prerequisites

*   A running MongoDB instance.
*   Node.js and npm installed.

---

## 2. Setup and Configuration

### a) Server (`.env`)

1.  Navigate to the `server/` directory.
2.  Create a `.env` file by copying the `.env.example`.
3.  Fill in the required values:
    *   `MONGO_URI`: Your MongoDB connection string.
    *   `JWT_SECRET` & `DEVICE_SECRET`: Any long, random strings for security.
    *   **M-Pesa Credentials**: If testing M-Pesa, fill in your sandbox credentials from the Safaricom Developer Portal.

### b) Desktop App (`.env`)

1.  Navigate to the `desktop/` directory.
2.  Create a `.env` file.
3.  Add the following line, pointing to your running server:
    ```
    VITE_APP_API_URL=http://localhost:4001
    ```

### c) Portal App (`.env`)

1.  Navigate to the `portal/` directory.
2.  Create a `.env` file.
3.  Add the following line, pointing to your running server:
    ```
    VITE_APP_API_URL=http://localhost:4001
    ```

---

## 3. Running the Full Stack

You will need three separate terminals to run the entire application.

### a) Terminal 1: Start the NestJS Server

1.  **Navigate to the Server Directory:**
    ```bash
    cd server
    ```
2.  **Install Dependencies (if first time):**
    ```bash
    npm install
    ```
3.  **Seed the Database (Recommended):**
    This creates a test Super Admin, a regular user, and sample products.
    ```bash
    npm run seed
    ```
4.  **Start the Server:**
    ```bash
    npm run start:dev
    ```
    The server will run on `http://localhost:4001`.

### b) Terminal 2: Start the Electron Desktop App

1.  **Navigate to the Desktop Directory:**
    ```bash
    cd desktop
    ```
2.  **Install Dependencies (if first time):**
    ```bash
    npm install
    ```
3.  **Start the App:**
    ```bash
    npm run dev
    ```
    The POS application window will open.

### c) Terminal 3: Start the SvelteKit Portal App

1.  **Navigate to the Portal Directory:**
    ```bash
    cd portal
    ```
2.  **Install Dependencies (if first time):**
    ```bash
    npm install
    ```
3.  **Start the App:**
    ```bash
    npm run dev
    ```
    The portal will be available at `http://localhost:5173`.

---

## 4. Testing Procedures

### a) Whiz Cloud Portal (Super Admin)

1.  **Login:**
    *   Open `http://localhost:5173` in your browser.
    *   Log in with the Super Admin credentials (from the seeder or your `.env` file).
2.  **Business Management:**
    *   You should be redirected to the `/dashboard/businesses` page.
    *   Verify that you can see a list of businesses.
    *   Click "Add New Business", fill out the form, and confirm that the new business appears in the list.
3.  **API Key Lifecycle:**
    *   For a new business with no keys, click "Issue Key". Verify that a new, 'Inactive' key appears.
    *   Click the "Activate Key" button next to the inactive key. Verify that its status changes to 'Active'.

### b) Desktop POS App (Cashier)

1.  **First-Time Device Linking:**
    *   Clear `localStorage` in the Electron DevTools.
    *   On launch, enter the 'Active' API Key you created in the portal.
    *   Confirm you are redirected to the PIN login screen.
2.  **Login & Sales:**
    *   Log in with a cashier's PIN (e.g., `1234` for the seeded user).
    *   Add items to the cart.
    *   Test each payment method: **Cash**, **Card**, **Credit**, and **M-Pesa**.
    *   Confirm that after each sale, a success message is shown and a receipt file is generated in the `server/receipts` directory.
3.  **Credit Settlement & Summary:**
    *   After making a few **Credit** sales, click "Credit Settlement" in the header.
    *   Verify you can see the list of unpaid transactions.
    *   Mark a few as "Paid" and confirm they disappear from the list.
    *   Click "End of Day Summary" and verify that the sales totals are correct and broken down by payment type, including paid/unpaid credit.
4.  **Product Management:**
    *   Click "Product Management" in the header.
    *   Verify you can create, update, and delete products. Changes should be reflected in the main POS terminal view.
