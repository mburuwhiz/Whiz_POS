# WHIZ POS

WHIZ POS is a modern, feature-rich Point of Sale system designed for cafés and restaurants. It features a multi-component architecture including a desktop application (Electron), a back-office web dashboard (Node.js/Express), and a mobile companion app (Capacitor).

## Architecture Overview

The system consists of three main parts:

1.  **Desktop Application (Main POS)**: Built with Electron and React. This is the core POS terminal used for processing sales, printing receipts, and managing daily operations. It operates offline-first.
2.  **Back-Office Web Application**: A Node.js/Express application (intended to be hosted on a cloud server). It serves as the central hub for data synchronization, advanced reporting, inventory management, and remote business oversight.
3.  **Mobile Application**: A Capacitor-based Android app that connects to the Desktop App (via local API) or the Back-Office (via cloud API) to provide mobile POS capabilities.

### Data Synchronization
*   **Offline-First**: The Desktop App stores all data locally in JSON files.
*   **Sync**: When online, the Desktop App synchronizes transactions, products, and customers with the Back-Office API.
*   **Local API**: The Desktop App runs a local Express server (default port 3000) to serve requests from local mobile devices (e.g., tableside ordering).

## Project Structure

*   `electron.cjs`: Main process entry point for Electron. Handles window creation, IPC (Inter-Process Communication), printing logic, and the local API server.
*   `preload.js`: Preload script that securely exposes Node.js capabilities (filesystem, printing) to the renderer process via `window.electron`.
*   `src/`: Source code for the React frontend (Renderer process).
    *   `components/`: UI components (POS interface, Modals, Reports).
    *   `store/posStore.ts`: Zustand store for state management. Handles business logic, data persistence, and sync queue processing.
    *   `pages/`: Top-level page components.
*   `print-jobs.cjs`: Logic for generating HTML templates for receipts and reports.

## Setup and Installation

### Prerequisites
*   Node.js (v18 or higher)
*   npm (v9 or higher)

### Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    This command starts both the Vite dev server for the frontend and the Electron app.
    ```bash
    npm run dev
    ```

### Building for Production

1.  **Build Desktop App (Windows/Linux)**:
    ```bash
    npm run build:exe
    ```
    This will generate an installer (e.g., `.exe` or `.AppImage`) in the `dist` or `release` directory.

2.  **Build Mobile App (Android)**:
    ```bash
    npm run build:apk
    ```
    *(Note: You must have Android Studio and the Android SDK configured).*

## Usage Guide

### Initial Setup
1.  Launch the application.
2.  Complete the **Business Registration** wizard. Enter your business name, address, and creates the first Admin user.
3.  The system will automatically print a startup invoice/confirmation.

### Processing Sales
1.  **Login** using your 4-digit PIN.
2.  Add items to the cart from the **Product Grid**.
3.  Click **Checkout**.
4.  Select Payment Method:
    *   **Cash**: Standard cash transaction.
    *   **M-Pesa**: Record mobile money payments.
    *   **Credit**: Assign the sale to a registered credit customer.
5.  The receipt will print automatically upon completion.

### Reports
*   Go to the **Reports** page to view daily sales summaries.
*   Use the **Closing Report** feature at the end of the day to print a breakdown of sales by cashier and payment method.

### Settings & Sync
*   Navigate to **Settings** to manage users, update business details, or configure the cloud sync API.
*   **On-Screen Keyboard**: Can be enabled/disabled in settings for touch-screen terminals.

## API & Integration

### Local API (Desktop)
The Desktop App exposes a local API for mobile devices to connect to.
*   **Get Config**: Generates a QR code containing the API Key and IP address for mobile pairing.

### Back-Office Sync
The application pushes data to the cloud via a configured API Endpoint.
*   **Endpoint**: Configurable in Settings.
*   **Auth**: Requires an API Key.
*   **Sync Queue**: Operations (sales, product updates) are queued and retried automatically if the internet connection is lost.

## Troubleshooting

*   **Printer Issues**: Ensure the printer is set as the system default or selected in the print dialog. The app uses the native system print dialog.
*   **Sync Failures**: Check the "Sync Status" page for detailed error logs. Verify the API URL and Key in Settings.
*   **Keyboard**: If the on-screen keyboard doesn't appear, ensure it is enabled in Settings > Business.

## License
Proprietary software developed by Whiz Tech.
