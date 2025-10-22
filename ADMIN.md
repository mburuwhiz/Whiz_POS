# WHIZ POS v2.0 - Admin Guide

This document provides instructions for administrative tasks.

## Creating a New User

User registration is an admin-only task. To create a new user, you must run the `createUser.js` script from the command line.

### Prerequisites

1.  You must have Node.js and npm installed.
2.  You must have a `.env` file in the `src/server` directory with a valid `MONGO_URI`.

### Usage

1.  Navigate to the `src/server/scripts` directory in your terminal.
2.  Run the script with the following command, replacing the placeholders with the actual user details:

    ```bash
    node createUser.js <email> <password> <pin> <role>
    ```

### Example

```bash
node createUser.js admin@example.com mysecretpassword 1234 Admin
```

### Roles

The available roles are:
- `Admin`
- `Manager`
- `Cashier`
- `Stock Clerk`
