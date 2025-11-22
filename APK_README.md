# WHIZ POS Mobile App (APK) Documentation

## Overview
The WHIZ POS Mobile App is a lightweight, Android-based extension of the WHIZ POS ecosystem. It is designed to allow waiters and mobile cashiers to take orders, process transactions, and print receipts directly from the floor, utilizing the Desktop POS as a central server and print gateway.

## Architecture: Local Network Sync
Unlike the Desktop-to-Cloud sync, the Mobile App synchronizes directly with the Desktop POS application over the **Local Area Network (LAN/WiFi)**.

**Key Concept:** The Desktop POS acts as the "Server" for the Mobile App. The Mobile App does not connect directly to the MongoDB cloud database; instead, it pushes data to and pulls data from the Desktop POS.

### 1. Connection Mechanism
-   **Discovery:** The Desktop POS generates a QR Code containing its Local IP Address and a secure API Key.
-   **Pairing:** The Mobile App scans this QR Code to establish a secure connection.
-   **Security:** All requests are authenticated using the API Key.

### 2. Synchronization Logic (Robust & Real-Time)
The synchronization strategy mirrors the robust "Push-Pull" architecture used in the Back Office integration:

#### A. Immediate Bi-Directional Sync
-   **Push (Mobile to Desktop):** When a transaction is completed on the mobile device, it is immediately added to a local sync queue. The app attempts to push this queue to the Desktop POS instantly.
-   **Pull (Desktop to Mobile):** Immediately upon a successful Push (or at regular intervals), the Mobile App requests the latest data (Products, Customers, Users) from the Desktop POS.
-   **Benefit:** This ensures that stock levels are updated on the mobile device seconds after a sale is made on the Desktop, and vice versa.

#### B. Offline-First Design
-   **Queueing:** If the connection to the Desktop is lost (e.g., WiFi drops), all transactions are securely stored in the mobile device's local storage.
-   **Auto-Retry:** The app continually monitors network status. Once the connection to the Desktop IP is restored, the sync queue is processed automatically.
-   **Partial Failure Handling:** If a batch of transactions is sent and some fail (e.g., invalid data), the system logs the specific errors but processes the successful ones, preventing the queue from being blocked by a single bad record.

#### C. Remote Printing
-   Since mobile devices cannot easily connect to thermal receipt printers via USB, the Mobile App delegates printing to the Desktop POS.
-   **Workflow:**
    1.  Mobile App sends transaction data to Desktop API (`/api/print`).
    2.  Desktop POS receives the request and formats the receipt using the standard HTML templates.
    3.  Desktop POS prints the receipt on its connected USB thermal printer.

## Setup Guide for Mobile Users

### Prerequisites
1.  **WiFi Network:** Both the Desktop PC and the Android Device must be connected to the **same WiFi network**.
2.  **Desktop App Running:** The WHIZ POS Desktop application must be open and running.

### Step-by-Step Connection
1.  **On Desktop:**
    -   Go to **Manage > Devices & Connections**.
    -   You will see a **Mobile App Connection** section with a QR Code.
    -   Ensure the displayed IP address (e.g., `192.168.1.x`) is correct.

2.  **On Mobile App:**
    -   Open the WHIZ POS App.
    -   Tap **"Scan QR Code"** on the login/setup screen.
    -   Scan the code displayed on the Desktop.
    -   The app will verify the connection and download the latest products and users.

### Troubleshooting
-   **"Connection Failed":** Ensure both devices are on the same WiFi. Check if Windows Firewall is blocking the Desktop App (Port 5000 or configured port).
-   **"Pending Sync":** If you see a yellow sync icon, it means data is saved locally. Move closer to the WiFi router or check if the Desktop App is running.

## Developer Notes

### API Endpoints (Hosted by Desktop POS)
The Desktop POS exposes the following endpoints (via `electron-web-server` or similar internal server) for the Mobile App:

-   `GET /api/products`: Fetch current product list and stock.
-   `GET /api/users`: Fetch active users/cashiers.
-   `POST /api/transaction`: Submit a new transaction.
-   `POST /api/print`: Request a receipt print job.
-   `POST /api/sync`: Bulk sync endpoint for offline recovery.

### Building the APK
To build the Android application:
```bash
# 1. Build the web assets
npm run build

# 2. Sync with Capacitor
npx cap sync

# 3. Open Android Studio to build signed APK
npx cap open android
```
