# WHIZ POS v2.0 Project Phases

This document outlines the development phases for the WHIZ POS v2.0 project.

## Phase 1: Project Setup & Foundation

- [x] Create project directories (`src`, `src/server`).
- [x] Initialize frontend `package.json`.
- [x] Create frontend entry point (`src/index.tsx`).
- [x] Initialize backend `package.json`.
- [x] Create backend entry point (`src/server/server.ts`).
- [x] Install frontend dependencies (`npm install`).
- [x] Install backend dependencies (`npm install` in `src/server`).
- [x] Create initial folder structure (`components`, `pages`, `models`, `routes`, `controllers`).

## Phase 2: Backend Development - Core API

- [x] **Database & Models:**
    - [x] Define Mongoose schemas for:
        - [x] `Business`
        - [x] `User` (Admin, Manager, Cashier, etc.)
        - [x] `Device`
        - [x] `Product`
        - [x] `Sale`
        - [x] `Customer`
- [x] **Authentication & Authorization:**
    - [ ] Implement user registration. *(Note: Moved to the separate Whiz Cloud Portal component, not part of this API).*
    - [x] Implement user login (PIN-based for POS, password-based for admin).
    - [x] Implement JWT generation and validation.
    - [x] Implement role-based access control (RBAC) middleware.
- [ ] **API Endpoints (Routes & Controllers):**
    - [x] `auth` routes (`/login/password`, `/login/pin`).
    - [x] `product` routes (CRUD operations).
    - [x] `business` routes (protected registration).
    - [ ] `sale` routes (create, view, refund).
    - [ ] `user` routes (CRUD for user management).
    - [ ] `device` routes (linking, management).

## Phase 3: Frontend Development - UI & Logic

- [ ] **Core Components:**
    - [ ] Design and build reusable UI components (buttons, inputs, cards, modals).
    - [ ] Implement routing using `react-router-dom`.
- [ ] **Authentication Flow:**
    - [ ] Create Login page (for desktop PIN and admin password).
    - [ ] Create API key entry/QR scan screen for initial device setup.
    - [ ] Implement protected routes for authenticated users.
- [ ] **POS Interface:**
    - [ ] Create the main sales screen.
    - [ ] Product grid/list view.
    - [ ] Shopping cart/order summary.
    - [ ] PIN entry modal for cashier login.
- [ ] **Back Office/Admin Dashboard:**
    - [ ] Dashboard overview (sales, stats).
    - [ ] Product management page.
    - [ ] User management page.
    - [ ] Settings page (receipt customization, etc.).

## Phase 4: Integration & Feature Completion

- [ ] Connect frontend components to backend API endpoints.
- [ ] Implement real-time sync between devices (WebSocket or polling).
- [ ] Implement receipt printing/generation.
- [ ] Implement offline functionality (local storage buffer).

## Phase 5: Testing & Deployment

- [ ] Write unit tests for critical backend logic.
- [ ] Write integration tests for API endpoints.
- [ ] Conduct end-to-end testing of user flows.
- [ ] Prepare for deployment (build scripts, environment configuration).
- [ ] Deploy backend to a cloud service (e.g., Heroku, AWS).
- [ ] Deploy frontend to a static hosting service (e.g., Netlify, Vercel).
