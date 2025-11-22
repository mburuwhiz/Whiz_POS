# WHIZ POS Mobile App (APK) Documentation

## Overview
The WHIZ POS Mobile App is a robust, Android-based extension of the WHIZ POS ecosystem. It empowers waiters and mobile cashiers to take orders, process transactions, and print receipts directly from the floor, seamlessly integrating with the Desktop POS as its central server.

## Architecture: Local Network Sync
The Mobile App employs a **Local-First, Offline-Ready** architecture. It synchronizes directly with the Desktop POS application over the **Local Area Network (LAN/WiFi)** using a secure, efficient protocol.

**Key Concept:** The Desktop POS acts as the authoritative "Server" for the Mobile App. The Mobile App maintains its own local database (persisted on the device) and synchronizes with the Desktop POS to push sales and pull inventory updates. It **does not** connect directly to the cloud Back Office.

### 1. Connection & Security
-   **Discovery & Pairing:** The Desktop POS generates a unique QR Code containing its Local IP Address (e.g., `192.168.1.x:3000`) and a cryptographically secure API Key.
-   **Authentication:** The Mobile App scans this QR Code to pair. All subsequent API requests are signed with a `Bearer` token using this API Key.
-   **Persistent Session:** The connection details are stored securely on the device, allowing auto-reconnection.

### 2. Synchronization Logic ("The Perfect Sync")
The Mobile App uses the same battle-tested synchronization engine as the Desktop-to-Cloud integration, adapted for the local network:

#### A. Offline-First Mutation Queue (Push)
-   **Zero-Latency UI:** When a user completes a transaction, it is *immediately* saved to the local persistent store (SQLite/LocalStorage). The UI updates instantly, regardless of network status.
-   **Operation Queue:** The transaction is simultaneously added to a persistent `SyncQueue`.
-   **Intelligent Push:**
    -   The `SyncEngine` monitors network connectivity.
    -   When connected to the Desktop Server, it processes the queue in FIFO (First-In-First-Out) order.
    -   **Batch Processing:** Operations are sent to the Desktop API (`POST /api/transactions`).
    -   **Retry Mechanism:** If a network error occurs, the item remains in the queue and is retried automatically with exponential backoff.
    -   **Partial Failure Handling:** If a specific transaction is rejected by the server (e.g., validation error), it is logged and removed from the active queue to prevent blocking valid subsequent operations.

#### B. Reactive Data Fetching (Pull)
-   **Triggered Updates:** A successful Push operation immediately triggers a Pull operation. This ensures that as soon as a sale is recorded, the mobile device fetches the latest stock levels.
-   **Periodic Polling:** In addition to event-driven updates, the app polls the Desktop Server every 10-30 seconds to fetch updates (e.g., price changes, new products, stock adjustments made on the Desktop).
-   **Conflict Resolution:** The Desktop POS is the "Source of Truth". Incoming data from the server overwrites local data for Products and Users, ensuring consistency across all devices.

#### C. Remote Printing Gateway
-   **Delegation:** Android devices often lack drivers for specific USB thermal printers. The Mobile App solves this by delegating print jobs.
-   **Flow:**
    1.  Mobile App constructs the transaction object.
    2.  It sends a `POST /api/print-receipt` request to the Desktop POS.
    3.  The Desktop POS receives the payload, generates the HTML receipt using the shared templates, and prints it via its locally connected USB printer.

## Setup Guide for Mobile Users

### Prerequisites
1.  **WiFi Network:** Ensure both the Desktop PC and the Android Device are connected to the **same WiFi network**.
2.  **Desktop App:** Launch the WHIZ POS Desktop application.

### Step-by-Step Connection
1.  **On Desktop:**
    -   Navigate to **Manage > Devices & Connections**.
    -   Locate the **Mobile App Connection** card.
    -   Verify the IP Address is correct and the QR Code is visible.

2.  **On Mobile App:**
    -   Open the WHIZ POS App.
    -   On the Setup/Login screen, tap **"Scan QR Code"**.
    -   Point the camera at the QR Code on the Desktop screen.
    -   Upon success, the app will authenticate and immediately sync the latest products and users.

### Troubleshooting
-   **"Connection Failed":**
    -   Verify both devices are on the same WiFi network (check 2.4GHz vs 5GHz bands).
    -   **Firewall:** Ensure Windows Firewall allows incoming connections to the Desktop App (default port `3000` or as configured).
-   **"Sync Pending" (Yellow Icon):**
    -   This indicates data is stored locally but hasn't reached the Desktop.
    -   Ensure the Desktop App is running.
    -   Move closer to the WiFi router to improve signal strength.

## Developer Notes

### API Endpoints (Hosted by Desktop POS)
The Desktop POS runs a local Express server (managed in `electron.cjs`) to serve these endpoints:

| Endpoint | Method | Description | Payload/Params |
| :--- | :--- | :--- | :--- |
| `/api/config` | `GET` | Get server status & config | Auth not required (for discovery) |
| `/api/products` | `GET` | Fetch all active products | Headers: `Authorization: Bearer <KEY>` |
| `/api/users` | `GET` | Fetch active users | Headers: `Authorization: Bearer <KEY>` |
| `/api/transactions` | `POST` | Push new transactions | Body: `Transaction` object |
| `/api/print-receipt` | `POST` | Request remote print | Body: `{ transaction: Transaction, businessSetup: BusinessSetup }` |

### Building the APK
To build the Android application from the source:

```bash
# 1. Build the web assets (Vite build)
npm run build

# 2. Sync web assets to the Native Android container
npx cap sync android

# 3. Open Android Studio to build/sign the APK
npx cap open android
# OR build directly (if Gradle is configured)
cd android && ./gradlew assembleDebug
```
