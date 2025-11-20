# WHIZ POS Mobile APK

## Overview
The WHIZ POS Mobile application acts as an extension of the main Desktop POS system. It allows waiters and cashiers to take orders, process payments, and manage tables directly from a mobile device.

## Connection Setup

To connect the Mobile App to the main Desktop POS system, follow these steps:

### 1. Generate API Key on Desktop
1.  Open the **WHIZ POS Desktop Application**.
2.  Navigate to the **Manage** page (Gear icon).
3.  Locate the **Mobile & Back Office Connection** section.
4.  If no API Key is visible, click the **Refresh/Generate** button (circular arrows icon).
5.  A unique API Key and a QR Code will be generated.

### 2. Connect Mobile App
1.  Open the **WHIZ POS Mobile App** on your Android device.
2.  On the initial setup screen, you will be prompted to connect to the server.
3.  **Method A: Scan QR Code (Recommended)**
    *   Tap the **"Scan QR Code"** button.
    *   Point your device's camera at the QR Code displayed on the Desktop App's Manage page.
    *   The app will automatically capture the API Key and Server URL.
4.  **Method B: Manual Entry**
    *   Tap **"Enter Manually"**.
    *   Enter the **API Key** exactly as shown on the Desktop App (use the Copy button on the Desktop App to avoid errors if sharing via text).
    *   Enter the **Server URL** (e.g., `http://<desktop-ip-address>:3000`).

## Features
*   **Order Taking:** Browse menu, add items to cart, and send orders to the kitchen/bar.
*   **Payments:** Process Cash and M-Pesa payments.
*   **Sync:** Orders placed on mobile are instantly synced to the Desktop POS.

## Troubleshooting
*   **Connection Failed:** Ensure both the Desktop computer and the Mobile device are connected to the **same Wi-Fi network**.
*   **Firewall:** Ensure the Desktop computer's firewall allows incoming connections on port 3000 (or the configured API port).
