# WHIZ POS v2.0 - Admin Guide

This document provides instructions for administrative tasks for both Super Admins and Business Admins.

## Super Admin: Registering a New Business

As the Super Admin, you are the only one who can create new businesses.

1.  Log in using your designated `SUPER_ADMIN_EMAIL` and password.
2.  You will be redirected to the **Super Admin Dashboard**.
3.  Use the "Register New Business" form on this dashboard to create a new business and its first Business Admin user.
4.  Upon successful registration, a unique API key for the new business will be displayed. **Store this API key securely and provide it to the Business Admin.**

## Business Admin: Managing Users

As a Business Admin, you can manage the users for your business.

1.  Log in with your email and password.
2.  You will be redirected to the **Business Admin Dashboard**.
3.  From here, you can view all existing users and create new ones (e.g., Cashiers, Managers) using the "Create New User" form.

## POS Device Setup

To link a POS terminal to a business, you must enter the business's unique API key into the POS login screen (`/pos-login`). This will fetch the list of users for that specific business, allowing for PIN-based login.

## Super Admin: Adding Additional Users to an Existing Business (CLI)

For advanced use cases, the Super Admin can add users to any business using the `createUser.js` command-line script.

### Prerequisites

1.  You must have Node.js and npm installed.
2.  You must have a `.env` file in the `src/server` directory with a valid `MONGO_URI`.
3.  You must know the `_id` of the business you want to add the user to. You can find this in your MongoDB database.

### Usage

1.  Navigate to the `src/server/scripts` directory in your terminal.
2.  Run the script with the following command:
    ```bash
    node createUser.js <email> <password> <pin> <role> <businessId>
    ```

### Example
```bash
node createUser.js cashier@example.com newpassword 5678 Cashier 60d5f2f5c7b3b3b3b3b3b3b3
```
