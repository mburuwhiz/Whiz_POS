# WHIZ POS v2.0 - Testing Strategy

This document outlines the testing strategy for the Business Local Server. It covers the current state of testing and the plan for future test implementation.

## Current Testing State (As of 2025-10-23)

The project is in its initial phase, with the foundational structure, API specification, and database models in place. At this stage, automated tests have not yet been implemented. However, we can perform the following manual verification steps to ensure the current progress is solid.

### 1. Environment Configuration Verification

The server is designed to be fully environment-driven. To test this:

*   **Action:**
    1.  Create a `.env` file in the `server/` directory by copying `server/.env.example`.
    2.  Set the `PORT` variable in the `.env` file to `4001`.
    3.  Run the application using `npm run start:dev` from within the `server/` directory.
*   **Expected Outcome:** The server should start successfully and log a message indicating that it is listening on port `4001`, not the hardcoded fallback of `3000`. This confirms that the application is correctly reading from the environment configuration.

### 2. Database Connection Test

The application is configured to connect to a MongoDB instance via the `MONGO_URI` environment variable.

*   **Action:**
    1.  Ensure a MongoDB instance is running and accessible.
    2.  Set a valid `MONGO_URI` in the `server/.env` file (e.g., `MONGO_URI=mongodb://localhost:27017/whiz_pos_test`).
    3.  Start the application.
*   **Expected Outcome:** The application should start without any database connection errors. The NestJS and Mongoose logs should indicate that a connection to the MongoDB server was successfully established. If the URI is invalid, the application should fail to start with a clear error message.

### 3. Schema Definition Verification

The Mongoose schemas have been created in `server/src/schemas/`.

*   **Action:** Manually review each schema file (`user.schema.ts`, `business.schema.ts`, etc.).
*   **Expected Outcome:** Each schema should correctly match the data structures defined in the `docs/api-spec.yaml` file. This includes checking for correct field names, types, required flags, and relationships. This has been conceptually verified during the development of the schemas.

## Future Testing Strategy

As we move forward and implement business logic, we will introduce a comprehensive suite of automated tests. The project is already configured with **Jest** as the testing framework.

### 1. Unit Tests

*   **Scope:** Test individual components (services, controllers, helpers) in isolation.
*   **Goal:** Verify that each unit of code performs its specific function correctly. For example, a `UserService` method for creating a user would be tested to ensure it correctly calls the Mongoose model with the right data.
*   **Tools:** Jest, with mocking for dependencies (e.g., mocking Mongoose models).

### 2. Integration Tests

*   **Scope:** Test the interaction between multiple components.
*   **Goal:** Ensure that different parts of the application work together as expected. For example, testing that a request to a controller endpoint correctly triggers the associated service, which then interacts with the database.
*   **Tools:** A dedicated test database or an in-memory MongoDB server to avoid interfering with development data.

### 3. End-to-End (E2E) Tests

*   **Scope:** Test the entire application flow, from API request to response.
*   **Goal:** Simulate real-world usage and verify that the API behaves exactly as defined in the OpenAPI specification.
*   **Tools:** The NestJS E2E testing framework, which uses `supertest` to make live HTTP requests to the running application.

This multi-layered approach will ensure that the Business Local Server is reliable, robust, and correct as we build it out.
