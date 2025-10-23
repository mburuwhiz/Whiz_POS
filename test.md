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

### d) Testing the End-to-End Sales Flow

1.  **PIN Login:**
    *   In the Electron app, select "Jane Cashier" from the dropdown.
    *   Use the numeric keypad to enter the PIN: `1234`.
    *   Click "Enter". You should be successfully logged in and see the main POS Terminal screen.

2.  **Create a Sale:**
    *   The left panel should display a grid of products (Espresso, Latte, etc.).
    *   Click on several products. They should appear in the "Current Order" panel on the right.
    *   The Subtotal, Tax, and Total will update automatically.

3.  **Finalize the Transaction:**
    *   Click the "Cash" or "Card" button.
    *   An alert should confirm "Sale complete!".
    *   The "Current Order" panel will clear, ready for the next sale.

This confirms that the desktop UI is successfully communicating with the NestJS server, fetching data, and posting new transactions to the database.
