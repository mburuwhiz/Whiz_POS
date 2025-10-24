# WHIZ POS v2.0 - Detailed Project Description

This document provides a comprehensive overview of the WHIZ POS v2.0 project, including its architecture, technology stack, current status, and development roadmap.

---

## 1. Project Overview

**Tagline:** “Intelligence in Every Transaction” — A unified retail platform for smart sales, analytics, and business growth.

WHIZ POS v2.0 is a next-generation Point of Sale (POS) ecosystem designed for businesses such as cafés and restaurants. The system is a hybrid model, combining a central "Whiz Cloud Services" with per-business "Business Local Servers." This architecture ensures that desktop and mobile applications can function offline and sync with the cloud when a connection is available.

The project is currently in a transitional phase, moving from a legacy Node.js/Express application to a more robust and scalable architecture based on TypeScript, NestJS, and Svelte.

---

## 2. System Architecture

The WHIZ POS v2.0 ecosystem consists of the following components:

| Component                      | Platform                | Description                                                                                             |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------- |
| **Whiz Cloud Portal**          | Web (admin-only)        | Centralized business registration, license control, and global monitoring dashboard for all vendors.      |
| **Whiz POS Server (Local)**    | Windows 10/11 / Linux   | Local bridge for device syncing, print management, and offline operation buffer.                        |
| **Whiz POS Desktop App (.exe)**| Windows                 | Cashier and manager terminal with fast offline-first capabilities and multi-device sync.                  |
| **Whiz POS Mobile App (.apk)** | Android                 | Portable POS terminal for field operations, cafés, and service outlets.                                 |
| **Whiz POS Back Office (Web)** | Web Browser             | Cloud-based management and analytics console for registered businesses.                                 |
| **Whiz Analytics Engine**      | Cloud (Optional)        | AI-based data insights, sales predictions, and behavior analytics.                                      |

### Communication Model

```
[Whiz Cloud Portal] ←→ [Whiz POS Server] ←→ [Business Databases]
↑ ↑
| |
[POS Apps] [Back Office]
```

---

## 3. Technology Stack

*   **Backend:** TypeScript, NestJS
*   **Frontend (Desktop):** Electron, Svelte, Vite
*   **Frontend (Web):** SvelteKit (planned)
*   **Frontend (Mobile):** Capacitor (planned)
*   **Database:** MongoDB (local), MongoDB Atlas (cloud)
*   **Caching:** Redis (recommended)
*   **Object Storage:** MinIO / S3 (recommended)

---

## 4. Current Status (As of 2025-10-24)

### a) Legacy Express.js Application

*   **Status:** Deprecated and being replaced. It is partially functional but has known authentication and redirect issues.

### b) New NestJS Application (Business Local Server)

*   **Status:** Functional Core. The server has a database connection, real authentication, and modules for users, products, transactions, devices, and businesses.
*   **How to Run:**
    1.  `cd server`
    2.  `npm install`
    3.  `npm run start:dev`
    4.  The server runs on `http://localhost:4001`.

### c) New Desktop POS Application

*   **Status:** Core UI and functionality are in place. The application can connect to the NestJS server, perform PIN-based login, and process sales.
*   **How to Run:**
    1.  `cd desktop`
    2.  `npm install`
    3.  `npm run dev`

---

## 5. Development Roadmap

### Phase 1: Core Authentication & Setup (In Progress)

- [x] Initial server setup for authentication website
- [x] Implement database connection (MongoDB)
- [x] Create User model with hashed passwords & PINs (bcrypt)
- [x] Implement admin-only user registration script
- [x] Implement user login with JWT
- [x] Implement PIN-based login for POS devices
- [x] Create Business model
- [x] Implement business registration and API key generation
- [x] Implement device linking with API key

### Phase 2: POS Application - Core Functionality

- [ ] Create Product model
- [ ] Implement product management (add, edit, delete)
- [ ] Implement sales processing
- [ ] Implement receipt generation (HTML/PDF)
- [ ] Implement inventory management
- [ ] Implement offline capabilities

### Phase 3: Back Office Portal

- [ ] Create a web-based dashboard for business owners
- [ ] Implement user management
- [ ] Implement product management
- [ ] Implement sales analytics and reporting
- [ ] Implement receipt customization

### Phase 4: Advanced Features & Integrations

- [ ] Implement Cloud AI Analytics Engine
- [ ] Implement Customer Loyalty System
- [ ] Implement E-Commerce Bridge
- [ ] Implement Kitchen Display System (KDS)
- [ ] Implement Franchise Dashboard

---

## 6. Security & Compliance

| Layer              | Security Measure                                                    |
| ------------------ | ------------------------------------------------------------------- |
| **Authentication** | API Key + JWT + PIN                                                 |
| **Encryption**     | AES-256 (local), TLS (network)                                      |
| **Access Control** | RBAC (Role-Based Access Control)                                    |
| **Audit Logs**     | Every login, sale, edit logged with timestamp                     |
| **License Revocation** | Portal can remotely disable all connected devices                 |
| **Data Residency** | Region-based MongoDB clusters for compliance (e.g., EU, Africa, US) |
