# WHIZ POS Back Office

## Overview
The WHIZ POS Back Office is a standalone Node.js application that serves as the central hub for data synchronization, reporting, and remote management. It is designed to be hosted on a web service (e.g., VPS, Heroku, AWS) separate from the desktop Electron application.

## Deployment Instructions

### 1. Prerequisites
*   Node.js (v18 or higher)
*   MongoDB (or a compatible database)

### 2. Installation
Since the Back Office is independent, it has its own `package.json`.

1.  Navigate to the back-office directory:
    ```bash
    cd back-office
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Configuration
Create a `.env` file in the `back-office` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whizpos
# Optional: Set a static API Key if not using dynamic database validation
ALLOWED_API_KEY=sk_your_generated_key_here
```

### 4. Running the Server
*   **Development:**
    ```bash
    npm run dev
    ```
*   **Production:**
    ```bash
    npm start
    ```

## Connecting the Desktop POS

To connect your Desktop POS to this hosted Back Office:

1.  **Deploy** this Back Office application to a public URL (e.g., `https://api.whizpos.com`).
2.  Open the **WHIZ POS Desktop Application**.
3.  Go to **Settings > Database**.
4.  Enter the **API URL** (e.g., `https://api.whizpos.com`).
5.  Go to the **Manage** page to generate an **API Key**.
    *   *Note:* In this version, you may need to manually configure the API key on the server side (e.g., in the database or `.env`) to match the one generated or used by the Desktop app, depending on your authentication implementation preference.
6.  The Desktop app will now sync data to this Back Office.

## API Endpoints

### `GET /`
Health check. Returns status and version.

### `POST /api/sync`
**Headers:** `Authorization: Bearer <API_KEY>`
Receives synchronization data (transactions, products, users) from the Desktop POS.
