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

## 2. Testing the New NestJS Application (Foundation)

This will run the new, in-progress NestJS server on `http://localhost:4001`.

### a) Prerequisites

*   No database is required for this version, as the API endpoint is mocked.

### b) Steps to Run

1.  **Navigate to the Server Directory:**
    ```bash
    cd server
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Server in Development Mode:**
    ```bash
    npm run start:dev
    ```
    The server will start and listen on `http://localhost:4001`.

### c) How to Test the Sample Endpoint

You can use a tool like `curl` or an API client (like Postman or Insomnia) to test the `POST /auth/pin-login` endpoint.

**Using `curl`:**

Open a new terminal and run the following command:

```bash
curl -X POST http://localhost:4001/auth/pin-login \
-H "Content-Type: application/json" \
-d '{
  "userId": "user_123",
  "pin": "4321",
  "deviceId": "dev_001"
}'
```

**Expected Response:**

You should receive a JSON response with mock data, similar to this:

```json
{
  "token": "sample-jwt-token-from-new-server",
  "user": {
    "_id": "user_123",
    "name": "Jane Cashier",
    "roles": ["Cashier"]
  },
  "sessionExpires": "..."
}
```

This confirms that the new NestJS server is running correctly and the sample `auth` module is functional.
