# WHIZ POS v2.0 - Admin Guide

This document provides instructions for administrative tasks.

## Registering a New Business

The primary method for registering a new business and its first admin user is through the secure registration page at `/register-business`. This page is protected by a `REGISTRATION_CODE` that must be set in your `.env` file. Upon successful registration, a unique API key for the new business will be displayed. **Store this API key securely.**

## POS Device Setup

To link a POS terminal to a business, you must enter the business's unique API key into the POS login screen (`/pos-login`). This will fetch the list of users for that specific business, allowing for PIN-based login.

## Adding Additional Users to an Existing Business

After a business has been created, you can add more users (e.g., Cashiers, Managers) to it using the `createUser.js` command-line script.

### Prerequisites

1.  You must have Node.js and npm installed.
2.  You must have a `.env` file in the `src/server` directory with a valid `MONGO_URI`.
3.  You must know the `_id` of the business you want to add the user to. You can find this in your MongoDB database.

### Usage

1.  Navigate to the `src/server/scripts` directory in your terminal.
2.  Run the script with the following command, replacing the placeholders with the actual user and business details:

    ```bash
    node createUser.js <email> <password> <pin> <role> <businessId>
    ```

### Example

```bash
node createUser.js cashier@example.com newpassword 5678 Cashier 60d5f2f5c7b3b3b3b3b3b3b3
```

### Roles

The available roles are:
- `Admin`
- `Manager`
- `Cashier`
- `Stock Clerk`
